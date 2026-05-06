'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {forgotPassword,isLoading} = useAuthStore();

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // fix: was missing
    try {
      await forgotPassword({ email }); 
    } catch {
      // error is already set in the store
      toast.error("Error while sending verify email");
    }
  }

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
                    onClick={() => router.push("/signIn")}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
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
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Reset your password
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base">
                      Enter your email and we'll send you a link to reset your
                      password
                    </p>
                  </div>

               

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="space-y-1.5">
                      <label
                        className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <div className="relative">
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
                          className="lucide lucide-mail absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                      type="submit"
                      disabled={loading}
                    >
                      Send reset link
                    </button>
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
  )
}

