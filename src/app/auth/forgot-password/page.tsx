"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  // Redirect authenticated users away from forgot password page
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        toast.success(`Password reset link sent! We've sent a password reset link to ${email}. Please check your inbox.`, {
          duration: 5000,
          icon: "📧",
        })
      } else {
        const data = await response.json()
        setError(data.message || "An error occurred")
        toast.error(data.message || "Failed to send reset link", {
          duration: 4000,
        })
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.", {
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-orange-100 rounded-full p-4">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Password reset email sent
            </h3>
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSuccess(false)}
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                try again
              </button>
            </p>
          </div>

          <Link href="/auth/login">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending reset link...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              Send Reset Link
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-orange-600 hover:text-orange-500 font-semibold">
            Sign in here
          </Link>
        </p>
      </div>

    </AuthLayout>
  )
}
