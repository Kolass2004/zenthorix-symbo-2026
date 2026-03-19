import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { extractUPIFromImage } from "@/lib/gemini";
import { sendTicketEmail, generateTicketId } from "@/lib/email";
import { appendToGoogleSheet, uploadImageToDrive } from "@/lib/google-docs";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { screenshot, name, email, collegeName, phoneNo, department, year, eventPair1, eventPair2, eventPair3, greenWave } = data;

    if (!screenshot) {
      return NextResponse.json({ message: "Screenshot missing." }, { status: 400 });
    }

    // 1. Validate payment screenshot via Gemini
    const upiId = await extractUPIFromImage(screenshot);

    if (!upiId) {
      return NextResponse.json({ 
        message: "UPI Transaction ID not found in the screenshot. Please upload a clear valid payment receipt." 
      }, { status: 400 });
    }

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

    // 4.5. Upload image to Google Drive
    const imageUrl = await uploadImageToDrive(screenshot, `${ticketId}_Payment.jpg`);

    // 5. Save to Google Sheets
    // Columns: Timestamp, Ticket ID, Name, Email, College, Phone, Department, Year, Pair 1, Pair 2, Pair 3, GreenWave, UPI, ScreenshotUrl
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
