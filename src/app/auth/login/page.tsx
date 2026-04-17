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
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

function LoginForm() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const welcomeToastShown = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login } = useAuth()
  const redirectTo = searchParams.get("redirect")
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/dashboard"

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
      router.push(safeRedirect)
    }
  }, [user, router, safeRedirect])

  // Toast: message param (e.g. from verify-email), or "Welcome back!" for returning users
  useEffect(() => {
    if (welcomeToastShown.current) return
    const errorMessage = searchParams.get("error")
    if (errorMessage) {
      welcomeToastShown.current = true
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }
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
      await login(data.email, data.password, false)
      if (typeof window !== "undefined") {
        localStorage.setItem("hasLoggedInBefore", "true")
      }
      toast.success("Signed in successfully! Redirecting...")
      router.push(safeRedirect)
    } catch (error: any) {
      const msg = error.message || "Login failed. Please check your credentials."
      setError(msg)
      toast.error(msg)
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

        <GoogleAuthButton mode="login" redirectTo={safeRedirect} disabled={loading} />

        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-orange-400" />
            Or
            <span className="w-1 h-1 rounded-full bg-orange-400" />
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gray-200 to-gray-200" />
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Email Address
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10">
              <Mail className="h-full w-full" strokeWidth={1.5} />
            </div>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email address"
              {...registerField("email")}
              className={`h-14 pl-12 pr-4 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.email ? "border-red-500 ring-red-50" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Password
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10">
              <Lock className="h-full w-full" strokeWidth={1.5} />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...registerField("password")}
              className={`h-14 pl-12 pr-12 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.password ? "border-red-500 ring-red-50" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-90"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end px-1">
          <Link href="/auth/forgot-password" title="Recover your password" className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest transition-all hover:translate-x-1">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-16 rounded-2xl bg-gray-900 border border-white/20 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <div className="relative z-10 flex items-center justify-center gap-3">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 text-orange-500" />
                Sign In
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </div>
        </Button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 decoration-2 transition-all">
            Create an account
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
