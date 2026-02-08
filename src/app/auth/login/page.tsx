"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

function LoginForm() {
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const welcomeToastShown = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login } = useAuth()

  const {
    register: registerField,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get("redirect")
      const safeRedirect = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard"
      router.push(safeRedirect)
    }
  }, [user, router, searchParams])

  // Toast: message param (e.g. from verify-email), or "Welcome back!" for returning users
  useEffect(() => {
    if (welcomeToastShown.current) return
    const message = searchParams.get("message")
    if (message) {
      welcomeToastShown.current = true
      toast.success(message)
      return
    }
    if (typeof window !== "undefined" && localStorage.getItem("hasLoggedInBefore") === "true") {
      welcomeToastShown.current = true
      toast("Welcome back! Sign in to continue.", { icon: "👋" })
    }
  }, [searchParams])

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError("")

    try {
      await login(data.email, data.password, rememberMe)
      if (typeof window !== "undefined") {
        localStorage.setItem("hasLoggedInBefore", "true")
      }
      toast.success("Signed in successfully! Redirecting...")
      const redirectTo = searchParams.get("redirect")
      const safeRedirect = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard"
      router.push(safeRedirect)
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6" noValidate>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="text"
              placeholder="Enter your email address"
              {...registerField("email")}
              className={`h-12 text-base pl-10 ${errors.email ? "border-red-500" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...registerField("password")}
              className={`h-12 text-base pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
            />
            <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
              Remember me
            </Label>
          </div>
          <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-500 font-semibold">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-orange-600 hover:text-orange-500 font-semibold">
            Sign up here
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
