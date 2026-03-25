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
    
    let totalOnline = 0;
    let totalOfflinePending = 0;
    let totalOfflineVerified = 0;

    snapshot.docs.forEach(doc => {
      const docData = doc.data();
      if (docData.upiId === "offline" || docData.provider === "offline") {
        if (docData.status === "pending") {
          totalOfflinePending++;
        } else if (docData.status === "verified") {
          totalOfflineVerified++;
        }
      } else {
        // Automatically assume online verified if it bypassed the admin workflow
        totalOnline++;
      }
    });

    const totalValidAndPaid = totalOnline + totalOfflineVerified;
    const totalRevenue = totalValidAndPaid * 200; // 200 INR per ticket assumed

    return NextResponse.json({
      success: true,
      stats: {
        totalOnline,
        totalOfflinePending,
        totalOfflineVerified,
        totalValidAndPaid,
        totalRevenue
      }
    });

  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
