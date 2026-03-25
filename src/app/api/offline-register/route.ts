import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { generateTicketId } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, collegeName, phoneNo, department, year, eventPair1, eventPair2, eventPair3, greenWave } = data;

    // Validate required fields
    if (!name || !email || !phoneNo) {
      return NextResponse.json({ message: "Missing essential demographic fields." }, { status: 400 });
    }

    // Generate robust Ticket ID early
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
      upiId: "offline",      // Manually enforced flag to bypass generic checks
      provider: "offline",   // Administrator manual entry indicator
      imageUrl: "offline",   // No reciept required for manual cash
      status: "pending",     // Blocked until Administrators click 'Verify'
      ticketId,
      timestamp: new Date().toISOString(),
    };

    // Save strictly to Firestore without invoking NodeMailer or Google Sheets
    await db.collection("registrations").add(registrationData);

    return NextResponse.json({ 
      success: true, 
      ticketId
    });

  } catch (error) {
    console.error("Offline registration endpoint error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
