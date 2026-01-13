"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    const savedPassword = localStorage.getItem("rememberedPassword")

    if (savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])
  const message = searchParams.get("message")
  const error = searchParams.get("error")
  const authError = searchParams.get("auth_error")
  const authErrorDescription = searchParams.get("auth_error_description")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email)
      localStorage.setItem("rememberedPassword", password)
    } else {
      localStorage.removeItem("rememberedEmail")
      localStorage.removeItem("rememberedPassword")
    }

    try {
      setLoading(true)
      await login(email, password, rememberMe)
      toast.success('Login successful!')
      router.push(searchParams.get('redirect') || '/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)

      if (error?.message?.includes('Invalid credentials')) {
        toast.error('Invalid email or password. Please check your credentials.')
      } else if (error?.message?.includes('verify your email')) {
        toast.error('Please verify your email before logging in.')
      } else {
        toast.error(error?.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Marketdotcom account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg backdrop-blur-sm">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg backdrop-blur-sm">
            <p className="text-red-800 text-sm">
              Authentication error: {error.replace(/_/g, ' ').toLowerCase()}
            </p>
          </div>
        )}

        {authError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg backdrop-blur-sm">
            <p className="text-red-800 text-sm">
              Login failed: {authError.replace(/_/g, ' ').toLowerCase()}
              {authErrorDescription && (
                <span className="block mt-1 text-xs">{authErrorDescription}</span>
              )}
            </p>
          </div>
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
            className="h-12 text-base border-2 focus:border-orange-500"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-500 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center space-x-3">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600">
            Remember me for 30 days
          </label>
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
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-orange-600 hover:text-orange-500 font-semibold">
            Create one now
          </Link>
        </p>
      </div>

    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
