"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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

export default function RegistrationForm() {
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    control,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!screenshotFile) {
      toast.error("Please upload payment screenshot");
      return;
    }

    setIsSubmitting(true);
    setModalState('verifying');

    try {
      // Create Base64 URL for file
      const base64String = screenshotPreview?.split(",")[1];

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, screenshot: base64String }),
      });

      const result = await response.json();

      if (response.ok) {
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
                {["Quiztronix", "matching matrix", "None"].map((opt) => (
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

        {/* Payment Section */}
        <section className="space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-2xl font-semibold text-white">Payment & Verification</h2>
            <p className="text-neutral-400 text-sm mt-1">Scan the QR Code to pay ₹200 and upload your successful transaction screenshot.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className=" border border-neutral-800 rounded-2xl p-6 w-full md:w-1/2 flex flex-col items-center justify-center text-center">
              {/* <div className="w-16 h-16 bg-blue-600 rounded-full flex outline outline-4 outline-black items-center justify-center text-2xl font-bold mb-4 z-10 -mb-8">B</div> */}
              <div className="bg-white p-4 rounded-xl shadow-lg pt-10">
                <h3 className="text-black font-semibold text-lg mb-2">Bharath</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/payment-qr.jpg" 
                  alt="Payment QR" 
                  className="w-48 h-48 object-cover rounded shadow-sm mx-auto"
                />
                <p className="text-neutral-500 text-sm mt-3 font-medium">Scan to pay with any UPI app</p>
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-8 hover:border-red-600 transition-colors text-center cursor-pointer group relative overflow-hidden h-64 flex flex-col items-center justify-center bg-black/30">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                
                {screenshotPreview ? (
                  <div className="absolute inset-0 z-10 w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-contain bg-black/80 backdrop-blur-sm" />
                  </div>
                ) : (
                  <div className="space-y-2 z-10">
                    <div className="w-12 h-12 bg-neutral-900 rounded-full flex flex-col items-center justify-center mx-auto text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-sm">Click to upload payment screenshot</p>
                    <p className="text-neutral-500 text-xs text-center px-4">Our AI will automatically scan and verify your transaction ID from the image.</p>
                  </div>
                )}
              </div>
              
              {!screenshotFile && <p className="text-red-500 text-xs text-center">Screenshot is required for verification</p>}
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
                Processing AI Verification...
              </>
            ) : "Complete Registration"}
          </button>
        </div>
        {/* Modal Overlay */}
        {modalState !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => modalState === 'error' && setModalState('idle')}></div>
            <div className="relative bg-[#111] border border-neutral-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              {modalState === 'verifying' && (
                <>
                  <svg className="animate-spin h-16 w-16 text-red-600 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">Verifying Payment</h3>
                  <p className="text-neutral-400 text-sm">Please wait while our AI securely scans your transaction details...</p>
                </>
              )}
              {modalState === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                  <p className="text-neutral-400 text-sm mb-6">Your ticket has been sent to your email. Please join our official WhatsApp group for important event updates.</p>
                  <a 
                    href="https://chat.whatsapp.com/FKMVS90VRkDETvfy87CGcB" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors mb-3"
                  >
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"></path>
                    </svg>
                    Join WhatsApp Group
                  </a>
                  <button type="button" onClick={() => window.location.reload()} className="w-full text-neutral-400 hover:text-white py-2 text-sm transition-colors">Close & Start New</button>
                </>
              )}
              {modalState === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Verification Failed</h3>
                  <p className="text-neutral-400 text-sm mb-6">{errorMessage}</p>
                  <button type="button" onClick={() => setModalState('idle')} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
