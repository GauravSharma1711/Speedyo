'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    setError("")
    const res = await fetch("/api/signUp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) setError(data.message || data.error)
    else router.push(`/verify?email=${form.email}`)
  }

  const Field = ({ label, name, type, placeholder }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5 text-center">{label}</label>
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          {name === "name"
            ? <><circle cx="10" cy="7" r="3"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"/></>
            : name === "email"
            ? <><rect x="2" y="5" width="16" height="11" rx="2"/><path d="M2 7l8 5 8-5"/></>
            : <><rect x="5" y="9" width="10" height="8" rx="1.5"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/></>}
        </svg>
        <input type={type} placeholder={placeholder} value={(form as any)[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })} required
          className="w-full bg-[#f0f2f5] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
      <div className="w-full max-w-sm bg-white rounded-[20px] p-8 shadow-sm">

        <Link href="/signIn" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5l-5 5 5 5"/></svg>
          Back to sign in
        </Link>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-sm text-gray-400 mb-6">Join Speedyo today</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" name="email" type="email" placeholder="you@example.com"/>
          <Field label="Password" name="password" type="password" placeholder="Create a password"/>
          <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Re-enter password"/>

          <button type="submit" disabled={loading}
            className="w-full bg-[#111] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#333] disabled:opacity-50 transition">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account? <Link href="/signIn" className="font-bold text-gray-900">Sign in</Link>
        </p>
      </div>
    </div>
  )
}