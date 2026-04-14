import { db } from "@/lib/firebase/server";
import { Metadata } from "next";
import { Users, Globe, IndianRupee, Trophy, Heart } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zenthorix 2026 | Event Completed",
  description: "Zenthorix 2026 registration has successfully concluded. Thank you!",
};

export const dynamic = "force-dynamic";

export default async function EventCompleted() {
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
  const totalOffline = totalOfflinePending + totalOfflineVerified;
  const totalRevenue = totalValidAndPaid * 200; // 200 INR per ticket assumed

  return (
    <main className="min-h-[100dvh] bg-black text-white selection:bg-red-500 selection:text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-red-800/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-red-600/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-10 md:space-y-12 py-8 md:py-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 md:space-y-6 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-2 md:mb-4 animate-bounce duration-1000">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-red-500 shadow-red-500/50 drop-shadow-xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Concluded</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Thank you for making Zenthorix 2026 an overwhelming success! Registrations are now closed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-red-400 font-medium bg-red-500/10 w-fit mx-auto px-4 py-2 rounded-2xl md:rounded-full border border-red-500/20 text-sm md:text-base text-center">
            <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current shrink-0" />
            <span>We appreciate your overwhelming support</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          
          {/* Card 1: Total Registrations */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-5 md:p-6 rounded-3xl hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Total Attendees</p>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{totalValidAndPaid}</h3>
          </div>

          {/* Card 2: Online Registrations */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-5 md:p-6 rounded-3xl hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Online Registrations</p>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{totalOnline}</h3>
          </div>

          {/* Card 3: Offline Registrations */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-5 md:p-6 rounded-3xl hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Offline Registrations</p>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{totalOfflineVerified}</h3>
            {totalOfflinePending > 0 && (
              <p className="text-xs text-yellow-500/80 mt-1 md:mt-2 font-medium">
                +{totalOfflinePending} pending
              </p>
            )}
          </div>

          {/* Card 4: Amount Collected */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-5 md:p-6 rounded-3xl hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-1">Amount Collected</p>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">₹{totalRevenue.toLocaleString("en-IN")}</h3>
          </div>

        </div>

        {/* Footer actions or extra message */}
        <div className="mt-12 md:mt-16 text-center space-y-3 md:space-y-4 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl md:rounded-3xl p-6 md:p-8 mx-2 md:mx-0">
          <h4 className="text-lg md:text-xl font-bold text-white">Join the Community</h4>
          <p className="text-sm md:text-base text-gray-400 max-w-md mx-auto">
            For post-event updates, photos, and certificates, join our official WhatsApp group.
          </p>
          <a
            href="https://chat.whatsapp.com/EgXhEx8Y10m34hJbZ0D8J8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 md:mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 md:px-8 rounded-xl shadow-lg transition-transform hover:scale-105 text-sm md:text-base"
          >
            Join WhatsApp Group
          </a>
        </div>
        
      </div>
    </main>
  );
}
