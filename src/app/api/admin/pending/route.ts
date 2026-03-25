import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password } = data;

    // Hardcoded Admin Authentication Check
    if (email !== "admin123@gmail.com" || password !== "12345678") {
      return NextResponse.json({ message: "Unauthorized access detected." }, { status: 401 });
    }

    // Pull strictly pending offline tickets
    const snapshot = await db.collection("registrations")
      .where("status", "==", "pending")
      .get();

    const pendingList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ 
      success: true, 
      pending: pendingList
    });

  } catch (error) {
    console.error("Admin pending API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
