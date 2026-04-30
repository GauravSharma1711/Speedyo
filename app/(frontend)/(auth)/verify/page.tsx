
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { toast } from "sonner"; // or your toast lib

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last char
    setOtp(newOtp);
    if (value && index < 5) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => (newOtp[i] = char));
    setOtp(newOtp);
    focusInput(Math.min(pasted.length, 5));
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Email verified successfully!");
        router.push("/signIn");
      } else {
        toast.error(data.message || "Verification failed");
        // Clear OTP on error
        setOtp(Array(6).fill(""));
        focusInput(0);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendLoading(true);
    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("New code sent to your email!");
        setResendTimer(30);
        setOtp(Array(6).fill(""));
        focusInput(0);
      } else {
        toast.error(data.message || "Failed to resend code");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-[#eef1f6] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm w-full max-w-sm p-8">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sign in
        </button>

        {/* Shield Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#eef1f6] flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-[22px] font-bold text-gray-900 mb-2">
          Verify your email
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
          We've sent a 6-digit code to{" "}
          <span className="text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
            {email || "your email"}
          </span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2.5 mb-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className={`w-11 h-12 text-center text-lg font-semibold rounded-lg border-2 outline-none transition-all duration-150
                ${digit ? "border-gray-800 bg-gray-50 text-gray-900" : "border-gray-200 bg-white text-gray-900"}
                focus:border-gray-800 focus:bg-gray-50`}
            />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mb-6">
          Enter the verification code sent to your email
        </p>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || !isComplete}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${isComplete && !loading
              ? "bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying...
            </span>
          ) : "Verify email"}
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Didn't receive the code?{" "}
          {resendTimer > 0 ? (
            <span className="text-gray-400">
              Resend in <span className="font-semibold text-gray-600">{resendTimer}s</span>
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="font-bold text-gray-900 hover:underline disabled:opacity-50 transition-opacity"
            >
              {resendLoading ? "Sending..." : "Resend"}
            </button>
          )}
        </p>

      </div>
    </div>
  );
}