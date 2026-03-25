import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password } = data;

    if (email !== "admin123@gmail.com" || password !== "12345678") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await db.collection("registrations").get();
    
    const validRegistrations: any[] = [];

    snapshot.docs.forEach(doc => {
      const docData = doc.data();
      
      // Pull all online entrants, and ONLY offline verified entrants
      if (docData.status !== "pending") {
        validRegistrations.push({
          id: doc.id,
          ...docData
        });
      }
    });

    // Sort descending by timestamp
    validRegistrations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      all: validRegistrations
    });

  } catch (error) {
    console.error("All API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
