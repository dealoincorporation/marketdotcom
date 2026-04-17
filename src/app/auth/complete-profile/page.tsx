"use client"

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { AlertCircle, CheckCircle2, Loader2, Lock, Phone, User } from "lucide-react"
import toast from "react-hot-toast"

type CompletionUser = {
  id: string
  name?: string | null
  phone?: string | null
  hasPassword?: boolean
}

function getSafeRedirectPath(value: string | null): string {
  if (!value) return "/dashboard"
  if (value.startsWith("/") && !value.startsWith("//")) return value
  return "/dashboard"
}

function CompleteProfilePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token, setUser, isLoading } = useAuth()
  const safeRedirect = useMemo(() => getSafeRedirectPath(searchParams.get("redirect")), [searchParams])
  const reason = searchParams.get("reason")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [hasPassword, setHasPassword] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!token) {
      router.replace(`/auth/login?redirect=${encodeURIComponent("/auth/complete-profile")}`)
      return
    }

    const load = async () => {
      try {
        const res = await fetch("/api/auth/complete-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile")
        }

        const profileUser = data.user as CompletionUser
        setName(profileUser?.name || user?.name || "")
        setPhone(profileUser?.phone || (user as any)?.phone || "")
        setHasPassword(Boolean(profileUser?.hasPassword))

        if (data.needsProfileCompletion === false) {
          router.replace(safeRedirect)
          return
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to load profile completion data."
        setMessageType("error")
        setMessage(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, router, user, isLoading, safeRedirect])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setMessageType(null)

    if (!name.trim() || !phone.trim()) {
      const msg = "Name and phone number are required."
      setMessageType("error")
      setMessage(msg)
      toast.error(msg)
      return
    }

    if (password && password.length < 6) {
      const msg = "Password must be at least 6 characters."
      setMessageType("error")
      setMessage(msg)
      toast.error(msg)
      return
    }

    if (password && password !== confirmPassword) {
      const msg = "Passwords do not match."
      setMessageType("error")
      setMessage(msg)
      toast.error(msg)
      return
    }

    if (!token) {
      router.replace("/auth/login")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password: password || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile.")
      }

      setUser(data.user)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user))
      }
      setMessageType("success")
      setMessage("Profile completed successfully. Redirecting...")
      toast.success("Profile updated successfully.")
      router.replace(safeRedirect)
    } catch (error: any) {
      const msg = error?.message || "Failed to complete profile."
      setMessageType("error")
      setMessage(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const reasonMessage =
    reason === "checkout"
      ? "Please complete your profile before checkout."
      : "Please complete your profile to continue."

  return (
    <AuthLayout title="Complete your profile" subtitle="Just a few details to finish your account setup">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Alert className="rounded-2xl border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800 text-sm font-semibold">
            {reasonMessage}
          </AlertDescription>
        </Alert>

        {message && messageType && (
          <Alert
            className={`rounded-2xl ${messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={`font-semibold ${messageType === "success" ? "text-green-800" : "text-red-800"}`}
            >
              {message}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-14 pl-12 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Phone Number
              </Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  className="h-14 pl-12 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {!hasPassword && (
              <>
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-gray-500">
                    Optional: set a password so you can also sign in with email/password later.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Set Password (Optional)
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="h-14 pl-12 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="h-14 pl-12 rounded-2xl border-white/60 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-14 rounded-2xl bg-gray-900 text-white font-black text-[12px] uppercase tracking-[0.2em]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save and Continue"
              )}
            </Button>
          </>
        )}
      </form>
    </AuthLayout>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Complete your profile" subtitle="Loading…">
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </AuthLayout>
      }
    >
      <CompleteProfilePageInner />
    </Suspense>
  )
}
