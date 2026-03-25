"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  collegeName: z.string().min(2, "College name is required"),
  phoneNo: z.string().regex(/^\d{10}$/, "Must be a 10-digit phone number"),
  department: z.string().min(2, "Department is required"),
  year: z.enum(["I-YEAR", "II-YEAR", "III-YEAR", "IV-year"], {
    message: "Please select your year",
  }),
  eventPair1: z.enum(["Paper Pulse", "Roast Battle", "None"]),
  eventPair2: z.enum(["Quiztronix", "Matching Matrix", "None"]),
  eventPair3: z.enum(["404 Error Code", "Elite Gamerz", "None"]),
  greenWave: z.enum(["Yes", "No"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function OfflineRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketStateId, setTicketStateId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventPair1: "None",
      eventPair2: "None",
      eventPair3: "None",
      greenWave: "No",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setModalState('submitting');

    try {
      const response = await fetch("/api/offline-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setTicketStateId(result.ticketId);
        setModalState('success');
      } else {
        setErrorMessage(result.message || "Registration failed.");
        setModalState('error');
      }
    } catch (error) {
      setErrorMessage("An error occurred during registration. Please check your connection.");
      setModalState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabelErrors = (field: keyof FormValues) => {
    if (errors[field]) {
      return <span className="text-red-500 text-xs ml-2">{errors[field]?.message}</span>;
    }
    return null;
  };

  return (
    <>
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl backdrop-blur-sm">
      <Toaster position="top-center" />

      {/* Event Instructions / Details */}
      <div className="bg-red-950/30 border border-red-900/50 rounded-xl md:rounded-2xl p-5 md:p-6 mb-6 md:mb-8 text-neutral-300 space-y-2 md:space-y-3">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Important Instructions
        </h3>
        <ul className="list-disc list-inside space-y-2 ml-2 text-sm md:text-base">
          <li>Food, refreshments, and a registration kit will be provided for all participants.</li>
          <li>The registration fee is <strong className="text-white">₹200 per head</strong>.</li>
          <li>Participants must bring their college ID card for verification.</li>
          <li>Participants should follow the instructions of the event coordinators and maintain discipline.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        
        {/* Personal Details Section */}
        <section className="space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-2xl font-semibold text-white">Personal Details</h2>
            <p className="text-neutral-400 text-sm mt-1">Please enter your personal and college details accurately.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Name {getLabelErrors("name")}</label>
              <input 
                {...register("name")} 
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
                placeholder="John Doe" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Email {getLabelErrors("email")}</label>
              <input 
                {...register("email")} 
                type="email" 
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
                placeholder="john@example.com" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">College Name {getLabelErrors("collegeName")}</label>
              <input 
                {...register("collegeName")} 
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
                placeholder="Institute of Technology" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Phone No {getLabelErrors("phoneNo")}</label>
              <input 
                {...register("phoneNo")} 
                type="tel" 
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
                placeholder="1234567890" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Department {getLabelErrors("department")}</label>
              <input 
                {...register("department")} 
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
                placeholder="Computer Science" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Year {getLabelErrors("year")}</label>
              <select 
                {...register("year")} 
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all text-white appearance-none"
              >
                <option value="">Select Year</option>
                <option value="I-YEAR">I-YEAR</option>
                <option value="II-YEAR">II-YEAR</option>
                <option value="III-YEAR">III-YEAR</option>
                <option value="IV-year">IV-year</option>
              </select>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="space-y-6">
           <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-white">Event Registration</h2>
            <p className="text-neutral-400 text-xs md:text-sm mt-1">Select the events you want to participate in.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="bg-black/50 p-4 md:p-6 rounded-xl border border-neutral-800/50">
              <label className="text-sm font-medium text-neutral-300 block mb-4">Event Pair 1 *</label>
              <div className="space-y-3">
                {["Paper Pulse", "Roast Battle", "None"].map((opt) => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" value={opt} {...register("eventPair1")} className="w-4 h-4 text-red-600 bg-neutral-900 border-neutral-700 focus:ring-red-600 focus:ring-2" />
                    <span className="text-neutral-300 group-hover:text-white transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-black/50 p-4 md:p-6 rounded-xl border border-neutral-800/50">
              <label className="text-sm font-medium text-neutral-300 block mb-3 md:mb-4">Event Pair 2 *</label>
              <div className="space-y-2 md:space-y-3">
                {["Quiztronix", "Matching Matrix", "None"].map((opt) => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" value={opt} {...register("eventPair2")} className="w-4 h-4 md:w-5 md:h-5 text-red-600 bg-neutral-900 border-neutral-700 focus:ring-red-600 focus:ring-2" />
                    <span className="text-neutral-300 md:text-base text-sm group-hover:text-white transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-black/50 p-4 md:p-6 rounded-xl border border-neutral-800/50">
              <label className="text-sm font-medium text-neutral-300 block mb-3 md:mb-4">Event Pair 3 *</label>
              <div className="space-y-2 md:space-y-3">
                {["404 Error Code", "Elite Gamerz", "None"].map((opt) => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" value={opt} {...register("eventPair3")} className="w-4 h-4 md:w-5 md:h-5 text-red-600 bg-neutral-900 border-neutral-700 focus:ring-red-600 focus:ring-2" />
                    <span className="text-neutral-300 md:text-base text-sm group-hover:text-white transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-black/50 p-4 md:p-6 rounded-xl border border-neutral-800/50">
              <label className="text-sm font-medium text-neutral-300 block mb-3 md:mb-4">GreenWave (EVS Awareness) *</label>
              <div className="space-y-2 md:space-y-3">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" value={opt} {...register("greenWave")} className="w-4 h-4 md:w-5 md:h-5 text-red-600 bg-neutral-900 border-neutral-700 focus:ring-red-600 focus:ring-2" />
                    <span className="text-neutral-300 md:text-base text-sm group-hover:text-white transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-6">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating offline entry...
              </>
            ) : "Submit Registration"}
          </button>
        </div>
      </form>
    </div>

    {/* Modal Overlay */}
        {modalState !== 'idle' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => modalState === 'error' && setModalState('idle')}></div>
            <div className="relative bg-[#111] border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              {modalState === 'submitting' && (
                <>
                  <svg className="animate-spin h-16 w-16 text-red-600 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">Creating Entry</h3>
                  <p className="text-neutral-400 text-sm">Saving document to database securely...</p>
                </>
              )}
              {modalState === 'success' && (
                <>
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pending Approval!</h3>
                  <p className="text-neutral-400 text-sm mb-6">Your registration form was successfully recorded.</p>
                  
                  <div className="w-full bg-red-950/40 border border-red-900/50 p-4 rounded-xl mb-6">
                    <p className="text-xs text-red-400 uppercase tracking-wider font-bold mb-1">Your Ticket ID is</p>
                    <p className="text-3xl font-mono text-white tracking-[0.2em] font-bold">{ticketStateId}</p>
                  </div>

                  <p className="text-xs text-neutral-500 mb-6">Administrators will review your cash deposit on-site and manually approve the ticket.</p>

                  <button type="button" onClick={() => window.location.reload()} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors">Close & Start New</button>
                </>
              )}
              {modalState === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Registration Failed</h3>
                  <p className="text-neutral-400 text-sm mb-6">{errorMessage}</p>
                  <button type="button" onClick={() => setModalState('idle')} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}
    </>
  );
}
