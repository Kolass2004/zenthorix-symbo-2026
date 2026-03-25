import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { sendTicketEmail } from "@/lib/email";
import { appendToGoogleSheet } from "@/lib/google-docs";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password, ticketId } = data;

    // Hardcoded Admin Authentication Check
    if (email !== "admin123@gmail.com" || password !== "12345678") {
      return NextResponse.json({ message: "Unauthorized access detected." }, { status: 401 });
    }

    if (!ticketId) {
      return NextResponse.json({ message: "Missing target Ticket ID." }, { status: 400 });
    }

    // 1. Retrieve the specifically requested target document
    const snapshot = await db.collection("registrations")
      .where("ticketId", "==", ticketId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "Ticket ID not found in database." }, { status: 404 });
    }

    const targetDoc = snapshot.docs[0];
    const targetData = targetDoc.data();

    // Redundancy check to prevent double-firing emails
    if (targetData.status === "verified") {
      return NextResponse.json({ message: "This ticket has already been verified." }, { status: 400 });
    }

    // 2. Transmit the Official Verified Ticket Email
    await sendTicketEmail(targetData.email, targetData.name, targetData.ticketId, {
      eventPair1: targetData.eventPair1,
      eventPair2: targetData.eventPair2,
      eventPair3: targetData.eventPair3,
      greenWave: targetData.greenWave
    });

    // 3. Append to the generalized Google Sheet tracker
    // Columns: Timestamp, Ticket ID, Name, Email, College, Phone, Department, Year, Pair 1, Pair 2, Pair 3, GreenWave, UPI, Provider, ScreenshotUrl
    await appendToGoogleSheet([
      targetData.timestamp,
      targetData.ticketId,
      targetData.name,
      targetData.email,
      targetData.collegeName,
      targetData.phoneNo,
      targetData.department,
      targetData.year,
      targetData.eventPair1,
      targetData.eventPair2,
      targetData.eventPair3,
      targetData.greenWave,
      targetData.upiId || "offline",
      targetData.provider || "offline",
      targetData.imageUrl || "offline"
    ]);

    // 4. Update Document Status natively
    await targetDoc.ref.update({
      status: "verified",
      verifiedAt: new Date().toISOString(),
      verifiedBy: email
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully verified Ticket ID: ${ticketId}`
    });

  } catch (error) {
    console.error("Admin verify API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
