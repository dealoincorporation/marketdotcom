"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle, RefreshCw, Shield, Clock, AlertCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { AuthLayout } from "@/components/auth-layout"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

function VerifyEmailForm() {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const verifyToastShown = useRef(false)

  // Redirect authenticated users away from verify email page
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Toast when landing from registration (about to verify)
  useEffect(() => {
    if (verifyToastShown.current || !searchParams.get("email")) return
    verifyToastShown.current = true
    toast("Check your email for the verification code. Enter it below to continue.", {
      icon: "📧",
      duration: 6000,
    })
  }, [searchParams])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit

    const newCode = verificationCode.split('')
    newCode[index] = value
    setVerificationCode(newCode.join(''))

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setStatus("error")
      const msg = "Please enter the complete 6-digit verification code."
      setMessage(msg)
      toast.error(msg)
      return
    }

    setVerifying(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)
        toast.success("Email verified! Redirecting to sign in...")
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login?message=Email verified successfully. You can now sign in.")
        }, 3000)
      } else {
        const errMsg = data.message || "Verification failed. Check the code and try again."
        setStatus("error")
        setMessage(errMsg)
        toast.error(errMsg)
      }
    } catch (error) {
      console.error("Verification error:", error)
      const msg = "Something went wrong. Please try again."
      setStatus("error")
      setMessage(msg)
      toast.error(msg)
    } finally {
      setVerifying(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setStatus("error")
      setMessage("Please provide an email address")
      toast.error("Please provide an email address.")
      return
    }

    setResending(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResent(true)
        setStatus("success")
        setMessage("Verification code sent successfully. Please check your inbox.")
        toast.success("Verification code sent! Check your inbox.")
        setTimeout(() => setResent(false), 3000)
      } else {
        const errMsg = data.message || "Failed to send verification code."
        setStatus("error")
        setMessage(errMsg)
        toast.error(errMsg)
      }
    } catch (error) {
      console.error("Resend error:", error)
      const msg = "Something went wrong. Please try again."
      setStatus("error")
      setMessage(msg)
      toast.error(msg)
    } finally {
      setResending(false)
    }
  }

  const handleContinueToLogin = () => {
    router.push("/auth/login?message=Email verified successfully. You can now sign in.")
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a 6-digit verification code to your email"
    >
      <div className="space-y-10">
        {status === "error" && (
          <Alert variant="destructive" className="border-red-200/50 bg-red-50/50 backdrop-blur-md rounded-2xl">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-bold text-xs uppercase tracking-wider">{message}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="border-green-200/50 bg-green-50/50 backdrop-blur-md rounded-2xl">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-4">
                <p className="font-bold text-sm">{message}</p>
                <Button
                  onClick={handleContinueToLogin}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black text-[11px] uppercase tracking-widest rounded-xl"
                >
                  Continue to Sign In
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center">
          <div className="flex justify-center mb-10">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="relative"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10">
                <Shield className="h-12 w-12 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -inset-4 bg-orange-400/20 blur-2xl rounded-full -z-10 animate-pulse" />
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-orange-100 z-20">
                <span className="text-lg">🔐</span>
              </div>
            </motion.div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">
            Email Verification
          </h3>

          {email ? (
            <p className="text-sm font-bold text-gray-500 tracking-tight mb-8">
              A 6-digit verification code has been sent to <span className="text-orange-600 block sm:inline mt-1 sm:mt-0">{email}</span>
            </p>
          ) : (
            <div className="mb-8">
              <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-left ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-14 pl-12 pr-4 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all text-base text-gray-900 font-medium shadow-sm"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Code Input */}
        <div className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={verificationCode[index] || ''}
                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-16 sm:w-14 sm:h-20 text-center text-2xl font-black bg-white/60 backdrop-blur-md border-2 border-white rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-gray-900 shadow-xl hover:translate-y-[-2px]"
                disabled={verifying}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyCode}
            disabled={verifying || verificationCode.length !== 6}
            className="w-full h-16 rounded-2xl bg-gray-900 border border-white/20 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="relative z-10 flex items-center justify-center gap-3">
              {verifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 text-orange-500" strokeWidth={2} />
                  Verify Code
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </Button>
        </div>

        {/* Help Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
              <Clock className="h-3 w-3 text-orange-500" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Valid for 10:00m</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
              Didn't receive the code? <br className="sm:hidden" />
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 decoration-2 disabled:opacity-50 transition-all ml-1"
              >
                {resending ? "Resending..." : "Resend Code"}
              </button>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login")}
              className="w-full h-14 border border-white/60 bg-white/40 backdrop-blur-sm hover:bg-white/80 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all"
            >
              Back to Login
            </Button>
          </div>
        </div>

        {/* Support */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-4 text-center">
            Having trouble? Contact our support team for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" asChild className="rounded-lg">
              <Link href="mailto:marketdotcominfo@gmail.com">
                Email Support
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="rounded-lg">
              <Link href="tel:+2349031812756">
                Call Support
              </Link>
            </Button>
          </div>
        </div>
      </div>

    </AuthLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
