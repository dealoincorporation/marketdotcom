"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()
  const { register, user } = useAuth()

  // Redirect authenticated users away from register page
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const passwordStrength = {
    length: formData.password.length >= 6,
    hasNumber: /\d/.test(formData.password),
    hasLetter: /[a-zA-Z]/.test(formData.password),
  }

  const passwordScore = Object.values(passwordStrength).filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please check and try again.", {
        duration: 4000,
        style: {
          background: 'rgba(239, 68, 68, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }
      })
      setLoading(false)
      return
    }

    if (passwordScore < 3) {
      toast.error("Password must be at least 6 characters and contain both letters and numbers.", {
        duration: 5000,
        style: {
          background: 'rgba(239, 68, 68, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }
      })
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy to continue.", {
        duration: 4000,
        style: {
          background: 'rgba(239, 68, 68, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }
      })
      setLoading(false)
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        referralCode: formData.referralCode || undefined,
      })

      toast.success("Account created successfully!")
      router.push("/auth/verify-email?email=" + encodeURIComponent(formData.email))
    } catch (error: any) {
      console.error("Registration error:", error)

      if (error?.message?.includes("already exists")) {
        toast.error("An account with this email already exists. Please try logging in instead.")
      } else {
        toast.error(error?.message || "Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Marketdotcom and start shopping smarter"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-medium">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            className="h-12 text-base border-2 focus:border-orange-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            className="h-12 text-base border-2 focus:border-orange-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            className="h-12 text-base border-2 focus:border-orange-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralCode" className="text-gray-700 font-medium">
            Referral Code (Optional)
          </Label>
          <Input
            id="referralCode"
            name="referralCode"
            type="text"
            placeholder="Enter referral code for bonus"
            value={formData.referralCode}
            onChange={handleChange}
            className="h-12 text-base border-2 focus:border-orange-500"
          />
          <p className="text-xs text-gray-500">
            Have a referral code? Enter it here to get ₦50 bonus after registration!
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className="h-12 text-base pr-12 border-2 focus:border-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordScore === 1 ? 'bg-red-500 w-1/3' :
                      passwordScore === 2 ? 'bg-yellow-500 w-2/3' :
                      passwordScore === 3 ? 'bg-green-500 w-full' : 'w-0'
                    }`}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  passwordScore === 1 ? 'text-red-600' :
                  passwordScore === 2 ? 'text-yellow-600' :
                  passwordScore === 3 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {passwordScore === 1 ? 'Weak' : passwordScore === 2 ? 'Fair' : passwordScore === 3 ? 'Strong' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className={`flex items-center space-x-2 ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordStrength.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>At least 6 characters</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordStrength.hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordStrength.hasLetter ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Contains letters</span>
                </div>
                <div className={`flex items-center space-x-2 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordStrength.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Contains numbers</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-12 text-base pr-12 border-2 focus:border-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{" "}
            <Link href="/terms" className="text-green-600 hover:text-green-500 font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-green-600 hover:text-green-500 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700"
          disabled={loading || !acceptTerms}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
                <Link href="/auth/login" className="text-orange-600 hover:text-orange-500 font-semibold">
                  Sign in here
                </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
