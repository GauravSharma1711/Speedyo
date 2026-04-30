'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FormState = {
  email: string
  password: string
  confirmPassword: string
}

type FieldProps = {
  label: string
  name: keyof FormState
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Field = ({ label, name, type, placeholder, value, onChange }: FieldProps) => (
  <div className="space-y-1.5">
    <label
      className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700"
      htmlFor={name}
    >
      {label}
    </label>
    <div className="relative">
      {name === "email" ? (
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
      ) : (
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
      )}

      <input
        type={type}
        id={name}
        placeholder={placeholder}
        required
        value={value}
        onChange={onChange}
        className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400"
      />
    </div>
  </div>
)

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ email: "", password: "", confirmPassword: "" })
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
    else router.push(`/verify?email=${encodeURIComponent(form.email)}`)
  }

  const handleChange =
    (name: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }))
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              <div className="w-full">
                <div className="space-y-4">
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

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Create your account
                  </h2>

                  {error && (
                    <div className="mb-1 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="space-y-3">
                      <Field
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange("email")}
                      />
                      <Field
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={handleChange("password")}
                      />
                      <Field
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                      />
                    </div>

                    <button
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                      type="submit"
                      disabled={loading}
                    >
                      Create account
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