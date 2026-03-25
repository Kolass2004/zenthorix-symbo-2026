import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { sendTicketEmail } from "@/lib/email";
import { appendToGoogleSheet } from "@/lib/google-docs";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password, ticketIds } = data; // Note array instead of single ticketId

    if (email !== "admin123@gmail.com" || password !== "12345678") {
      return NextResponse.json({ message: "Unauthorized access detected." }, { status: 401 });
    }

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json({ message: "Missing target Ticket IDs." }, { status: 400 });
    }

    // Process Sequentially to strictly avoid Google Sheet write/rate-limit conflicts
    const results = [];

    for (const ticketId of ticketIds) {
      try {
        const snapshot = await db.collection("registrations")
          .where("ticketId", "==", ticketId)
          .limit(1)
          .get();

        if (snapshot.empty) {
          results.push({ ticketId, status: "Failed - Not Found" });
          continue;
        }

        const targetDoc = snapshot.docs[0];
        const targetData = targetDoc.data();

        if (targetData.status === "verified") {
            results.push({ ticketId, status: "Skipped - Already Verified" });
            continue;
        }

        // Email Transport
        await sendTicketEmail(targetData.email, targetData.name, targetData.ticketId, {
          eventPair1: targetData.eventPair1,
          eventPair2: targetData.eventPair2,
          eventPair3: targetData.eventPair3,
          greenWave: targetData.greenWave
        });

        // Sheet Push
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

        // Firebase Mutation
        await targetDoc.ref.update({
          status: "verified",
          verifiedAt: new Date().toISOString(),
          verifiedBy: email
        });

        results.push({ ticketId, status: "Success" });
      } catch (err) {
        console.error(`Error verifying ticket ${ticketId}`, err);
        results.push({ ticketId, status: "Failed - Internal Error" });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${ticketIds.length} tickets.`,
      results
    });

  } catch (error) {
    console.error("Bulk Admin verify API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
