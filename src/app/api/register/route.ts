import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { extractPaymentDetailsFromImage } from "@/lib/gemini";
import { sendTicketEmail, generateTicketId } from "@/lib/email";
import { appendToGoogleSheet } from "@/lib/google-docs";

async function uploadToImgBB(base64Data: string) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.warn("IMGBB_API_KEY not set. Skipping image upload.");
      return null;
    }

    const formData = new URLSearchParams();
    formData.append('image', base64Data);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      return result.data.url; // The direct image link
    } else {
      console.error("ImgBB Upload Failed:", result.error);
      return null;
    }
  } catch (error) {
    console.error("ImgBB API Error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { screenshot, name, email, collegeName, phoneNo, department, year, eventPair1, eventPair2, eventPair3, greenWave } = data;

    if (!screenshot) {
      return NextResponse.json({ message: "Screenshot missing." }, { status: 400 });
    }

    // 1. Validate payment screenshot via Gemini
    const paymentDetails = await extractPaymentDetailsFromImage(screenshot);

    if (!paymentDetails || !paymentDetails.transactionId) {
      return NextResponse.json({ 
        message: "UPI Transaction/Reference ID not found in the screenshot. Please upload a clear valid payment receipt." 
      }, { status: 400 });
    }

    if (paymentDetails.amount !== 200) {
      return NextResponse.json({ 
        message: `Invalid payment amount! We detected ₹${paymentDetails.amount}. The payment amount must be exactly ₹200.` 
      }, { status: 400 });
    }

    // Process edge cases with spaces or caps
    const expectedUpi = "bharathvive143-2@okhdfcbank";
    const actualUpi = paymentDetails.recipientUpi ? paymentDetails.recipientUpi.toLowerCase().replace(/\s/g, '') : '';
    
    if (!actualUpi.includes(expectedUpi)) {
      return NextResponse.json({ 
        message: `Invalid payment recipient! We detected the payment went to '${paymentDetails.recipientUpi || 'Unknown'}'. It must strictly be sent to ${expectedUpi}.` 
      }, { status: 400 });
    }

    const upiId = paymentDetails.transactionId;
    const provider = paymentDetails.provider || "Unknown";

    // 2. Check if UPI ID already exists in Firestore
    const snapshot = await db.collection("registrations")
      .where("upiId", "==", upiId)
      .get();

    if (!snapshot.empty) {
      return NextResponse.json({ 
        message: `Payment Transaction (${upiId}) has already been used with another registration.` 
      }, { status: 409 });
    }

    // 3. Generate Ticket ID
    const ticketId = generateTicketId();

    const registrationData = {
      name,
      email,
      collegeName,
      phoneNo,
      department,
      year,
      eventPair1,
      eventPair2,
      eventPair3,
      greenWave,
      upiId,
      ticketId,
      timestamp: new Date().toISOString(),
    };

    // 4. Save to Firestore
    await db.collection("registrations").add(registrationData);

    // 4.5. Upload image to ImgBB for permanent free hosting
    const imageUrl = await uploadToImgBB(screenshot);

    // 5. Save to Google Sheets
    // Columns: Timestamp, Ticket ID, Name, Email, College, Phone, Department, Year, Pair 1, Pair 2, Pair 3, GreenWave, UPI, Provider, ScreenshotUrl
    await appendToGoogleSheet([
      registrationData.timestamp,
      ticketId,
      name,
      email,
      collegeName,
      phoneNo,
      department,
      year,
      eventPair1,
      eventPair2,
      eventPair3,
      greenWave,
      upiId,
      provider,
      imageUrl || "Upload Failed"
    ]);

    // 6. Send Email with Ticket QR
    const emailSent = await sendTicketEmail(email, name, ticketId, {
      eventPair1,
      eventPair2,
      eventPair3,
      greenWave
    });

    return NextResponse.json({ 
      success: true, 
      ticketId,
      upiId,
      emailSent 
    });

  } catch (error) {
    console.error("Registration endpoint error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
