"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, Mail, Lock, User, Phone, Gift, Eye, EyeOff, ArrowRight } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

function RegisterPageInner() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, register } = useAuth()

  const {
    register: registerField,
    handleSubmit: handleFormSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: undefined,
    },
  })
  const referralCode = watch("referralCode")

  // Redirect authenticated users away from register page
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    const oauthError = searchParams.get("error")
    if (oauthError) {
      setError(oauthError)
      toast.error(oauthError)
    }
  }, [searchParams])

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError("")

    try {
      // Trim and handle referral code - send undefined if empty
      const referralCode = data.referralCode?.trim() || undefined

      await register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone.trim(),
        referralCode: referralCode,
      })
      // Redirect to verification page after successful registration
      router.push('/auth/verify-email?email=' + encodeURIComponent(data.email.trim().toLowerCase()))
    } catch (error: any) {
      const errMsg = error.message || "Registration failed. Please try again."
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to start shopping"
    >
      <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6" noValidate>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <GoogleAuthButton mode="register" referralCode={referralCode} disabled={loading} />

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
          <Label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Full Name
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10">
              <User className="h-full w-full" strokeWidth={1.5} />
            </div>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...registerField("name")}
              className={`h-14 pl-12 pr-4 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.name ? "border-red-500 ring-red-50" : ""}`}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{errors.name.message}</p>
          )}
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
          <Label htmlFor="phone" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Phone Number
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10">
              <Phone className="h-full w-full" strokeWidth={1.5} />
            </div>
            <Input
              id="phone"
              type="text"
              placeholder="Enter your phone number"
              {...registerField("phone")}
              className={`h-14 pl-12 pr-4 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.phone ? "border-red-500 ring-red-50" : ""}`}
            />
          </div>
          {errors.phone && (
            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{errors.phone.message}</p>
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
              placeholder="Create a strong password"
              {...registerField("password")}
              className={`h-14 pl-12 pr-12 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.password ? "border-red-500 ring-red-50" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-90"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Confirm Password
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10">
              <Lock className="h-full w-full" strokeWidth={1.5} />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...registerField("confirmPassword")}
              className={`h-14 pl-12 pr-12 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.confirmPassword ? "border-red-500 ring-red-50" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-90"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="referralCode" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Referral Code <span className="opacity-50 text-[9px]">(Optional)</span>
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10">
              <Gift className="h-full w-full" strokeWidth={1.5} />
            </div>
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter unique referral code"
              {...registerField("referralCode")}
              className="h-14 pl-12 pr-4 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>
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
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-orange-500" />
                Create Account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </div>
        </Button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 decoration-2 transition-all">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Create your account" subtitle="Sign up to start shopping">
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </AuthLayout>
      }
    >
      <RegisterPageInner />
    </Suspense>
  )
}
