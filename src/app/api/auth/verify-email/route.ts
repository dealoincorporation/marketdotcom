import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      )
    }

    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.user?.findUnique !== 'function') {
      return NextResponse.json(
        { message: "Email verification temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email address." },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified. You can now sign in." },
        { status: 200 }
      )
    }

    // Check if code matches
    if (user.emailVerificationToken !== code) {
      return NextResponse.json(
        { message: "Invalid verification code. Please check and try again." },
        { status: 400 }
      )
    }

    // Check if code has expired (10 minutes)
    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null, // Clear the code
        resetTokenExpiry: null // Clear expiry
      }
    })

    // Check if user was referred and give referrer points (admin-configured)
    if (user.referredById) {
      const referrer = await prisma.user.findUnique({
        where: { id: user.referredById }
      })
      const referralSettings = await prisma.referralSettings.findFirst({
        orderBy: { createdAt: 'desc' }
      })
      const pointsOnSignup = referralSettings?.referrerPointsOnSignup ?? 0

      if (referrer && pointsOnSignup > 0) {
        await prisma.reward.create({
          data: {
            userId: referrer.id,
            points: pointsOnSignup,
            description: `Referral signup: ${user.name || user.email}`,
            type: "REFERRAL"
          }
        })

        await prisma.referral.updateMany({
          where: {
            referrerId: referrer.id,
            referredEmail: user.email
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
            rewardAmount: 0
          }
        })

        await prisma.notification.create({
          data: {
            userId: referrer.id,
            title: "Referral points earned!",
            message: `You earned ${pointsOnSignup} points for referring ${user.name || user.email}. Convert points to cash in Wallet.`,
            type: "REFERRAL"
          }
        })

        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Referral complete",
            message: "Your referrer has received their reward.",
            type: "REFERRAL"
          }
        })
      } else if (referrer) {
        await prisma.referral.updateMany({
          where: {
            referrerId: referrer.id,
            referredEmail: user.email
          },
          data: {
            isUsed: true,
            usedAt: new Date()
          }
        })
      }
    }

    return NextResponse.json(
      { message: "Email verified successfully. You can now sign in to your account." },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Email verification error:", error)

    if (error.message?.includes("Prisma") || error.message?.includes("connect")) {
      return NextResponse.json(
        { message: "Database connection error. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: "Email verification failed. Please try again." },
      { status: 500 }
    )
  }
}

// GET endpoint for email verification via link click
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/auth/verify-email?error=missing_token", request.url))
    }

    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.user?.findFirst !== 'function') {
      return NextResponse.redirect(new URL("/auth/verify-email?error=service_unavailable", request.url))
    }

    // Find user with matching verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    })

    if (!user) {
      return NextResponse.redirect(new URL("/auth/verify-email?error=invalid_token", request.url))
    }

    if (user.emailVerified) {
      return NextResponse.redirect(new URL("/auth/verify-email?success=already_verified", request.url))
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null // Clear the token
      }
    })

    // Check if user was referred and give referrer points (admin-configured)
    if (user.referredById) {
      const referrer = await prisma.user.findUnique({
        where: { id: user.referredById }
      })
      const referralSettings = await prisma.referralSettings.findFirst({
        orderBy: { createdAt: 'desc' }
      })
      const pointsOnSignup = referralSettings?.referrerPointsOnSignup ?? 0

      if (referrer && pointsOnSignup > 0) {
        await prisma.reward.create({
          data: {
            userId: referrer.id,
            points: pointsOnSignup,
            description: `Referral signup: ${user.name || user.email}`,
            type: "REFERRAL"
          }
        })

        await prisma.referral.updateMany({
          where: {
            referrerId: referrer.id,
            referredEmail: user.email
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
            rewardAmount: 0
          }
        })

        await prisma.notification.create({
          data: {
            userId: referrer.id,
            title: "Referral points earned!",
            message: `You earned ${pointsOnSignup} points for referring ${user.name || user.email}. Convert points to cash in Wallet.`,
            type: "REFERRAL"
          }
        })

        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Referral complete",
            message: "Your referrer has received their reward.",
            type: "REFERRAL"
          }
        })
      } else if (referrer) {
        await prisma.referral.updateMany({
          where: {
            referrerId: referrer.id,
            referredEmail: user.email
          },
          data: {
            isUsed: true,
            usedAt: new Date()
          }
        })
      }
    }

    return NextResponse.redirect(new URL("/auth/verify-email?success=verified", request.url))
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL("/auth/verify-email?error=verification_failed", request.url))
  }
}