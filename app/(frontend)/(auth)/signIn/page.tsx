'use client'
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("Credentials", { email, password, redirect: false })
    setLoading(false)
    if (result?.error) setError(result.error)
    else router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                <span className="flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300">
                  <img
                    className="aspect-square h-full w-full object-cover"
                    alt="Speedyo logo"
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c05f78f_ChatGPTImageAug24202508_06_31PM.png"
                  />
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome to Speedyo
                </h1>
                <p className="text-slate-500 text-sm sm:text-base font-medium">
                  Sign in to continue
                </p>
              </div>

              <div className="w-full">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
                  >
                    <div className="transition-transform duration-200">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path
                          fill="#1877F2"
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        />
                      </svg>
                    </div>
                    <span>Continue with Facebook</span>
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      data-orientation="horizontal"
                      role="none"
                      className="shrink-0 h-[1px] w-full bg-slate-200"
                    />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                      or
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-5"
                >
                  <div className="space-y-3 sm:space-y-4">
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

                    <div className="space-y-1.5">
                      <label
                        className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700"
                        htmlFor="password"
                      >
                        Password
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
                          className="lucide lucide-lock absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                      disabled={loading}
                    >
                      Sign in
                    </button>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                      <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/signUp")}
                        className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Need an account?{" "}
                        <span className="font-medium text-slate-700">Sign up</span>
                      </button>
                    </div>
                  </div>
                </form>
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