import OfflineRegistrationForm from "@/components/OfflineRegistrationForm";

export default function OfflineRegistrationsPage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-800/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-4">
            ZENTHORIX <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">'25</span>
          </h1>
          <p className="text-neutral-400 text-base md:text-xl max-w-2xl mx-auto px-4 font-medium tracking-wide">
            OFFLINE DESK REGISTRATION
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <OfflineRegistrationForm />
        </div>
      </div>
    </main>
  );
}
