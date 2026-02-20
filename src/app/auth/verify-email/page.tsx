"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle, RefreshCw, Shield, Clock } from "lucide-react"
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
      <div className="space-y-8">
        {status === "error" && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{message}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-3">
                <p>{message}</p>
                <Button
                  onClick={handleContinueToLogin}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Continue to Sign In
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-800">🔐</span>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Enter Verification Code
          </h3>

          {email ? (
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit code to <strong className="text-orange-600">{email}</strong>
            </p>
          ) : (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
              />
            </div>
          )}
        </div>

        {/* Code Input */}
        <div className="space-y-6">
          <div className="flex justify-center space-x-3">
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
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-orange-400"
                disabled={verifying}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyCode}
            disabled={verifying || verificationCode.length !== 6}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="inline h-5 w-5 mr-2" />
                Verify Code
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {resent && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Verification code sent successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Help Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Code expires in 10 minutes</span>
          </div>

          <p className="text-center text-sm text-gray-500">
            Didn't receive the code? Check your spam folder or{" "}
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="text-orange-600 hover:text-orange-500 font-medium disabled:opacity-50 transition-colors"
            >
              {resending ? (
                <>
                  <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                  Sending...
                </>
              ) : (
                "resend it"
              )}
            </button>
          </p>

          <Button
            variant="outline"
            onClick={() => router.push("/auth/login")}
            className="w-full border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3"
          >
            Back to Sign In
          </Button>
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
