import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";
import { sendTicketEmail } from "@/lib/email";
import { appendToGoogleSheet } from "@/lib/google-docs";

// Background Queue Processor
async function processQueue(validTickets: any[], adminEmail: string) {
  for (const ticket of validTickets) {
    const { ticketId, data, refPath } = ticket;
    try {
      // 1. Send Email
      await sendTicketEmail(data.email, data.name, ticketId, {
        eventPair1: data.eventPair1,
        eventPair2: data.eventPair2,
        eventPair3: data.eventPair3,
        greenWave: data.greenWave
      });

      // 2. Append to Sheet
      await appendToGoogleSheet([
        data.timestamp,
        ticketId,
        data.name,
        data.email,
        data.collegeName,
        data.phoneNo,
        data.department,
        data.year,
        data.eventPair1,
        data.eventPair2,
        data.eventPair3,
        data.greenWave,
        data.upiId || "offline",
        data.provider || "offline",
        data.imageUrl || "offline"
      ]);

      // 3. Mark Background tasks complete
      const docRef = db.doc(refPath);
      await docRef.update({
        emailDispatched: true,
        sheetAppended: true,
      });

      console.log(`[Queue] Successfully fully-processed ticket ${ticketId}`);
    } catch (err) {
      console.error(`[Queue] Background processing failed for ${ticketId}:`, err);
    }
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password, ticketIds } = data;

    if (email !== "admin123@gmail.com" || password !== "12345678") {
      return NextResponse.json({ message: "Unauthorized access detected." }, { status: 401 });
    }

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json({ message: "Missing target Ticket IDs." }, { status: 400 });
    }

    // Step 1: Parallel Fetch all targets
    const fetchPromises = ticketIds.map(async (ticketId) => {
      const snapshot = await db.collection("registrations")
        .where("ticketId", "==", ticketId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const docData = doc.data();
        if (docData.status !== "verified") {
          return { ticketId, data: docData, refPath: doc.ref.path };
        }
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    const validTickets = results.filter(t => t !== null);

    if (validTickets.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No pending tickets found to verify (already processed)." 
      });
    }

    // Step 2: Instant Batch Mutation (UI feels instant)
    const batch = db.batch();
    for (const ticket of validTickets) {
      const docRef = db.doc(ticket.refPath);
      batch.update(docRef, {
        status: "verified",
        verifiedAt: new Date().toISOString(),
        verifiedBy: email
      });
    }
    await batch.commit();

    // Step 3: Spawn Non-Blocking Background Queue
    processQueue([...validTickets], email).catch(err => {
        console.error("Queue execution failed globally:", err);
    });

    // Step 4: Return Immediately 
    return NextResponse.json({ 
      success: true, 
      message: `Successfully approved ${validTickets.length} students. Emails are sending in the background!`
    });

  } catch (error) {
    console.error("Bulk Admin verify API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
