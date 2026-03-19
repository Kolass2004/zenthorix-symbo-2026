import RegistrationForm from "@/components/RegistrationForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-500 selection:text-white">
      {/* Header section with gradient */}
      <div className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Zenthorix <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">2026</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
            Secure your spot for the most anticipated tech symposium. Complete the form below to register and receive your ticket.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-32 max-w-4xl relative z-10">
        <RegistrationForm />
      </div>
    </main>
  );
}
