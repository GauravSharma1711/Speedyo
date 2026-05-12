
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { toast } from "sonner"; // or your toast lib
  import { useAuthStore } from "@/store/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

const { verifyOtp, resendOtp, isLoading, error } = useAuthStore();

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
    await verifyOtp({ email, otp: otpString });
    toast.success("Email verified successfully!");
    router.push("/signIn");
  } catch {
    toast.error(error ?? "Verification failed");
    setOtp(Array(6).fill(""));
    focusInput(0);
  } finally {
    setLoading(false);
  }
};

const handleResend = async () => {
  if (resendTimer > 0) return;

  setResendLoading(true);
  try {
    await resendOtp(email);
    toast.success("New code sent to your email!");
    setResendTimer(30);
    setOtp(Array(6).fill(""));
    focusInput(0);
  } catch {
    toast.error(error ?? "Failed to resend code");
  } finally {
    setResendLoading(false);
  }
};

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              <div className="w-full">
                <div className="space-y-4 sm:space-y-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-arrow-left h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="m12 19-7-7 7-7"></path>
                      <path d="M19 12H5"></path>
                    </svg>
                    Back to sign in
                  </button>

                  <div className="text-center space-y-2">
                    <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shield-check h-7 w-7 sm:h-8 sm:w-8 text-slate-700"
                        aria-hidden="true"
                      >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Verify your email
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base">
                      We've sent a 6-digit code to
                      <br />
                      <span className="font-medium text-slate-900">
                        {email || "your email"}
                      </span>
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleVerify()
                    }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div>
                      <div className="flex items-center justify-center gap-1.5">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              inputRefs.current[i] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            onFocus={(e) => e.target.select()}
                            className="flex rounded-lg border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-center w-10 h-11 text-base font-semibold"
                            autoComplete={
                              i === 0 ? "one-time-code" : "off"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-3">
                        Enter the verification code sent to your email
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={loading || !isComplete}
                        className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                      >
                        {loading ? "Verifying..." : "Verify email"}
                      </button>

                      <div className="text-center">
                        <p className="text-sm text-slate-600">
                          Didn't receive the code?{" "}
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading || resendTimer > 0}
                            className="font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {resendLoading ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                          </button>
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400 sm:hidden">
              <p>&nbsp;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}