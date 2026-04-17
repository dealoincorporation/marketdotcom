"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"

type GoogleAuthButtonProps = {
  mode: "login" | "register"
  redirectTo?: string
  referralCode?: string
  disabled?: boolean
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.4l-6.3-5.2C29.2 34.9 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.5 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-2.8 4.2-4 5.4l6.3 5.2C37.1 39 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

export function GoogleAuthButton({ mode, redirectTo, referralCode, disabled }: GoogleAuthButtonProps) {
  const href = useMemo(() => {
    const params = new URLSearchParams()
    params.set("mode", mode)
    if (redirectTo) params.set("redirect", redirectTo)
    if (mode === "register" && referralCode?.trim()) params.set("referralCode", referralCode.trim())
    return `/api/auth/google/start?${params.toString()}`
  }, [mode, redirectTo, referralCode])

  return (
    <Button
      asChild
      type="button"
      disabled={disabled}
      className="w-full h-14 rounded-2xl bg-white border border-gray-200 text-gray-800 font-bold text-[12px] uppercase tracking-[0.12em] shadow-sm hover:bg-gray-50 hover:border-gray-300"
    >
      <a href={href}>
        <span className="inline-flex items-center gap-3">
          <GoogleIcon />
          {mode === "register" ? "Continue with Google" : "Sign in with Google"}
        </span>
      </a>
    </Button>
  )
}
