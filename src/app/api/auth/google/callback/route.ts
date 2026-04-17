import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { generateToken } from "@/lib/auth"
import { sendAdminUserRegistrationNotification } from "@/lib/email"
import { getMissingProfileFields } from "@/lib/profile-completion"

export const dynamic = "force-dynamic"

type AuthMode = "login" | "register"
type OAuthStatePayload = {
  mode: AuthMode
  redirectTo: string
  referralCode?: string | null
}

function decodeStatePayload(value: string | undefined): OAuthStatePayload | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"))
    if (!parsed || typeof parsed !== "object") return null
    const mode: AuthMode = parsed.mode === "register" ? "register" : "login"
    const redirectTo =
      typeof parsed.redirectTo === "string" &&
      parsed.redirectTo.startsWith("/") &&
      !parsed.redirectTo.startsWith("//")
        ? parsed.redirectTo
        : "/dashboard"
    const referralCode =
      typeof parsed.referralCode === "string" && parsed.referralCode.trim()
        ? parsed.referralCode.trim()
        : null
    return { mode, redirectTo, referralCode }
  } catch {
    return null
  }
}

function getAppOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

function htmlAuthBridge(token: string, userJson: string, redirectTo: string) {
  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard"
  const escapedToken = JSON.stringify(token)
  const escapedUserJson = JSON.stringify(userJson)
  const escapedRedirect = JSON.stringify(safeRedirect)

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Signing you in...</title>
</head>
<body style="font-family: Inter, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#fff7ed; color:#111827;">
  <div style="text-align:center;">
    <p style="font-size:16px; margin:0;">Completing Google sign in...</p>
  </div>
  <script>
    (function () {
      try {
        localStorage.setItem("token", ${escapedToken});
        localStorage.setItem("user", ${escapedUserJson});
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("hasLoggedInBefore", "true");
        window.location.replace(${escapedRedirect});
      } catch (e) {
        window.location.replace("/auth/login?message=" + encodeURIComponent("Google sign in completed. Please log in again."));
      }
    })();
  </script>
</body>
</html>`
}

function redirectToAuthError(request: NextRequest, mode: AuthMode, message: string) {
  const appOrigin = getAppOrigin(request)
  const authPath = mode === "register" ? "/auth/register" : "/auth/login"
  const redirectUrl = new URL(authPath, appOrigin)
  redirectUrl.searchParams.set("error", message)
  return NextResponse.redirect(redirectUrl)
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const appOrigin = getAppOrigin(request)
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appOrigin}/api/auth/google/callback`

  const stateFromQuery = request.nextUrl.searchParams.get("state")
  const code = request.nextUrl.searchParams.get("code")
  const oauthError = request.nextUrl.searchParams.get("error")
  const stateCookie = request.cookies.get("google_oauth_state")?.value
  const payloadCookie = request.cookies.get("google_oauth_payload")?.value
  const statePayload = decodeStatePayload(payloadCookie) || {
    mode: "login" as AuthMode,
    redirectTo: "/dashboard",
    referralCode: null,
  }

  if (oauthError) {
    return redirectToAuthError(request, statePayload.mode, "Google authentication was cancelled.")
  }

  if (!clientId || !clientSecret) {
    return redirectToAuthError(request, statePayload.mode, "Google auth is not configured correctly.")
  }

  if (!stateFromQuery || !stateCookie || stateFromQuery !== stateCookie) {
    return redirectToAuthError(request, statePayload.mode, "Invalid Google auth session. Please try again.")
  }

  if (!code) {
    return redirectToAuthError(request, statePayload.mode, "Google did not return an authorization code.")
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    })

    const tokenData = await tokenResponse.json()
    const idToken = tokenData.id_token as string | undefined

    if (!tokenResponse.ok || !idToken) {
      return redirectToAuthError(request, statePayload.mode, "Could not verify Google account. Please try again.")
    }

    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { cache: "no-store" }
    )
    const tokenInfo = await tokenInfoResponse.json()

    if (!tokenInfoResponse.ok || tokenInfo.aud !== clientId) {
      return redirectToAuthError(request, statePayload.mode, "Google token verification failed.")
    }

    if (tokenInfo.email_verified !== "true") {
      return redirectToAuthError(request, statePayload.mode, "Your Google email is not verified.")
    }

    const email = String(tokenInfo.email || "").trim().toLowerCase()
    const name = String(tokenInfo.name || "").trim()
    const picture = String(tokenInfo.picture || "").trim()

    if (!email) {
      return redirectToAuthError(request, statePayload.mode, "Google account did not provide an email.")
    }

    const prisma = await getPrismaClient()
    if (!prisma || typeof prisma.user?.findUnique !== "function") {
      return redirectToAuthError(request, statePayload.mode, "Authentication is temporarily unavailable.")
    }

    let user = await prisma.user.findUnique({ where: { email } })
    let createdNewUser = false

    if (!user) {
      let referredById: string | null = null
      let appliedReferralCode: string | null = null

      if (statePayload.mode === "register" && statePayload.referralCode) {
        const referrer = await prisma.user.findFirst({
          where: { referralCode: statePayload.referralCode },
        })
        if (referrer) {
          referredById = referrer.id
          appliedReferralCode = statePayload.referralCode
        }
      }

      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          password: null,
          phone: null,
          image: picture || null,
          role: "CUSTOMER",
          emailVerified: new Date(),
          referralCode: Math.random().toString(36).substring(2, 15),
          referredById,
        },
      })
      createdNewUser = true

      if (appliedReferralCode && referredById) {
        await prisma.referral.create({
          data: {
            referrerId: referredById,
            referredEmail: user.email,
            code: appliedReferralCode,
            isUsed: true,
            usedAt: new Date(),
          },
        })

        await prisma.user.update({
          where: { id: user.id },
          data: {
            walletBalance: {
              increment: 500,
            },
          },
        })

        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Welcome Bonus!",
            message: "Congratulations! You've received ₦500 bonus for joining through a referral.",
            type: "REFERRAL",
          },
        })
      }

      try {
        await sendAdminUserRegistrationNotification({
          userId: user.id,
          name: user.name || "Unknown User",
          email: user.email || "No email provided",
          phone: user.phone || "No phone provided",
          registrationDate: user.createdAt.toISOString(),
          referralCode: appliedReferralCode || undefined,
          referrerName: undefined,
        })
      } catch (adminEmailError) {
        console.error("Failed to send admin registration notification for Google user:", adminEmailError)
      }
    } else {
      const needsUpdate = !user.emailVerified || (!user.name && !!name) || (!user.image && !!picture)
      if (needsUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: user.emailVerified || new Date(),
            name: user.name || name || undefined,
            image: user.image || picture || undefined,
          },
        })
      }
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || "CUSTOMER",
    }
    const accessToken = generateToken(tokenPayload, "24h")

    const userWithoutSensitiveData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      walletBalance: user.walletBalance,
      referralCode: user.referralCode,
      hasPassword: Boolean(user.password),
    }

    const missingFields = getMissingProfileFields(userWithoutSensitiveData)
    const redirectTo =
      missingFields.length > 0
        ? `/auth/complete-profile?source=google&redirect=${encodeURIComponent(statePayload.redirectTo)}`
        : statePayload.redirectTo

    const html = htmlAuthBridge(accessToken, JSON.stringify(userWithoutSensitiveData), redirectTo)
    const response = new NextResponse(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    })

    response.cookies.delete("google_oauth_state")
    response.cookies.delete("google_oauth_payload")

    if (createdNewUser) {
      console.log(`✅ Created Google user account: ${email}`)
    }

    return response
  } catch (error) {
    console.error("Google callback error:", error)
    return redirectToAuthError(request, statePayload.mode, "Google sign in failed. Please try again.")
  }
}
