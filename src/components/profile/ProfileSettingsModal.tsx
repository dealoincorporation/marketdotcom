"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Phone, Lock, Loader2, CheckCircle, AlertCircle, Settings, ShieldCheck, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { getMissingProfileFields } from "@/lib/profile-completion"

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")

  // Profile form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [hasPassword, setHasPassword] = useState(true)

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setPhone((user as any).phone || "")
      setHasPassword(Boolean((user as any).hasPassword))
      setProfileMessage(null)
      setPasswordMessage(null)
    }
  }, [isOpen, user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProfileMessage({ type: "success", text: "Profile updated successfully!" })
        if (setUser && data.user) {
          setUser(data.user)
        }
        setTimeout(() => setProfileMessage(null), 3000)
      } else {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile" })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      setProfileMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters long" })
      setPasswordLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" })
      setPasswordLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" })
        setHasPassword(true)
        if (setUser && user) {
          const updated = { ...user, hasPassword: true } as any
          setUser(updated)
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(updated))
          }
        }
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setPasswordMessage(null), 3000)
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" })
      }
    } catch (error) {
      console.error("Password change error:", error)
      setPasswordMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!isOpen) return null

  const missingFields = getMissingProfileFields({
    name,
    phone,
  })

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white/90 backdrop-blur-3xl border border-white/60 rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col premium-shadow"
      >
        {/* Header Section */}
        <div className="relative p-8 sm:p-10 border-b border-white/40 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Settings className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase">Profile Settings</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-1">Security & Account</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-2 gap-2 bg-gray-100/50 backdrop-blur-md mx-8 mt-8 rounded-3xl border border-white/60">
          {[
            { id: 'profile', label: 'Personal Information', icon: User },
            { id: 'password', label: 'Account Security', icon: ShieldCheck }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                ? "bg-gray-900 text-white shadow-xl"
                : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-orange-400' : ''}`} />
              <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "profile" ? (
              <motion.form
                key="profile-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleProfileUpdate}
                className="space-y-8"
              >
                {profileMessage && (
                  <Alert className={`rounded-2xl border-2 ${profileMessage.type === 'success' ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                    {profileMessage.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                    <AlertDescription className="font-bold text-gray-800 ml-2">{profileMessage.text}</AlertDescription>
                  </Alert>
                )}

                {missingFields.length > 0 && (
                  <Alert className="rounded-2xl border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="font-bold text-orange-800 ml-2">
                      Please complete your profile details. Missing: {missingFields.join(", ")}.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 pl-12 rounded-[1.25rem] border-white/60 bg-white/50 focus:ring-4 focus:ring-orange-100 font-bold"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 pl-12 rounded-[1.25rem] border-white/60 bg-white/50 focus:ring-4 focus:ring-orange-100 font-bold"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-14 pl-12 rounded-[1.25rem] border-white/60 bg-white/50 focus:ring-4 focus:ring-orange-100 font-bold"
                        placeholder="+234 000 000 0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    disabled={profileLoading}
                    className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                  >
                    {profileLoading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : "Update Profile"}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePasswordChange}
                className="space-y-8"
              >
                {passwordMessage && (
                  <Alert className={`rounded-2xl border-2 ${passwordMessage.type === 'success' ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                    {passwordMessage.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                    <AlertDescription className="font-bold text-gray-800 ml-2">{passwordMessage.text}</AlertDescription>
                  </Alert>
                )}

                {!hasPassword ? (
                  <Alert className="rounded-2xl border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="font-bold text-blue-800 ml-2">
                      You signed in with Google and do not have a password yet. Set one now to also login with email/password.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-14 pl-12 pr-12 rounded-[1.25rem] border-white/60 bg-white/50 focus:ring-4 focus:ring-orange-100 font-bold"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                      >
                        {showCurrentPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-14 pl-12 rounded-[1.25rem] border-white/60 bg-white/50 focus:ring-4 focus:ring-orange-100 font-bold"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-14 pl-12 rounded-[1.25rem] border-white/60 bg-white/50 focus:ring-4 focus:ring-orange-100 font-bold"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    disabled={passwordLoading}
                    className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                  >
                    {passwordLoading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : hasPassword ? "Change Password" : "Set Password"}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
