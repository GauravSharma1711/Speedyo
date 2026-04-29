'use client'
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
      <div className="w-full max-w-sm bg-white rounded-[20px] p-8 shadow-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center mb-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" className="w-10" alt="logo"/>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Welcome to Speedyo</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue</p>
        </div>

        {/* Facebook */}
        <button
          onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Continue with Facebook
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200"/>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"/>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5 text-center">Email</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="16" height="11" rx="2"/><path d="M2 7l8 5 8-5"/></svg>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-[#f0f2f5] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5 text-center">Password</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="9" width="10" height="8" rx="1.5"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/></svg>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••" required
                className="w-full bg-[#f0f2f5] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#111] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#333] disabled:opacity-50 transition">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <Link href="/forgot-password" className="font-semibold text-gray-800">Forgot password?</Link>
          <span>Need an account? <Link href="/signUp" className="font-bold text-gray-900">Sign up</Link></span>
        </div>
      </div>
    </div>
  )
}