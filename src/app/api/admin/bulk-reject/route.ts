import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password, ticketIds } = data; // Array of IDs

    if (email !== "admin123@gmail.com" || password !== "12345678") {
      return NextResponse.json({ message: "Unauthorized access detected." }, { status: 401 });
    }

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json({ message: "Missing target Ticket IDs." }, { status: 400 });
    }

    const batch = db.batch();
    
    // We can do this perfectly in parallel, or optimally via firestore Batches because there are NO external email/sheet calls required for a basic rejection state change.
    for (const ticketId of ticketIds) {
      const snapshot = await db.collection("registrations")
        .where("ticketId", "==", ticketId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        batch.update(snapshot.docs[0].ref, {
          status: "rejected",
          rejectedAt: new Date().toISOString(),
          rejectedBy: email
        });
      }
    }

    // Commit all parallel rewrites to master instantly
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully rejected ${ticketIds.length} tickets.`
    });

  } catch (error) {
    console.error("Bulk Admin reject API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
