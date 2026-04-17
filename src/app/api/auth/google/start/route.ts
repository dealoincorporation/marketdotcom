import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type AuthMode = "login" | "register"

function getSafeRedirectPath(redirectTo: string | null): string {
  if (!redirectTo) return "/dashboard"
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) return redirectTo
  return "/dashboard"
}

function getAppOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      { message: "Google auth is not configured. Missing GOOGLE_CLIENT_ID." },
      { status: 500 }
    )
  }

  const modeParam = request.nextUrl.searchParams.get("mode")
  const mode: AuthMode = modeParam === "register" ? "register" : "login"
  const redirectTo = getSafeRedirectPath(request.nextUrl.searchParams.get("redirect"))
  const referralCode = request.nextUrl.searchParams.get("referralCode")?.trim()
  const state = crypto.randomUUID()
  const appOrigin = getAppOrigin(request)
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appOrigin}/api/auth/google/callback`

  const statePayload = {
    mode,
    redirectTo,
    referralCode: referralCode || null,
  }

  const encodedPayload = Buffer.from(JSON.stringify(statePayload)).toString("base64url")

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", "openid email profile")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("prompt", "select_account")
  authUrl.searchParams.set("access_type", "offline")

  const response = NextResponse.redirect(authUrl)
  const isSecure = process.env.NODE_ENV === "production"

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    maxAge: 60 * 10,
    path: "/",
  })

  response.cookies.set("google_oauth_payload", encodedPayload, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    maxAge: 60 * 10,
    path: "/",
  })

  return response
}
