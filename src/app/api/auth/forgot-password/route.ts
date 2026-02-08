import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.user?.findUnique !== 'function') {
      return NextResponse.json(
        { message: "Password reset temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json(
        { message: "If an account with this email exists, we've sent a password reset link." },
        { status: 200 }
      )
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    console.log("Password reset token generated for user:", user.email)
    console.log("Reset URL will be:", `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${encodeURIComponent(resetToken)}`)

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken)
      console.log("Password reset email sent successfully to:", user.email)

      return NextResponse.json(
        { message: "Password reset email sent. We've sent a password reset link to your email address." },
        { status: 200 }
      )
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError)

      // Don't reveal email sending failure for security
      return NextResponse.json(
        { message: "If an account with this email exists, we've sent a password reset link." },
        { status: 200 }
      )
    }
  } catch (error: any) {
    console.error("Forgot password error:", error)

    if (error.message?.includes("Prisma") || error.message?.includes("connect")) {
      return NextResponse.json(
        { message: "Database connection error. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: "Password reset failed. Please try again." },
      { status: 500 }
    )
  }
}
