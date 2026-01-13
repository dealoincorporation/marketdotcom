import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getPrismaClient } from "@/lib/prisma"
import { sendEmailVerificationEmail } from "@/lib/email"
import crypto from "crypto"

// Force dynamic rendering to avoid Edge Runtime issues
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate input
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.user?.findUnique !== 'function') {
      return NextResponse.json(
        { message: "Registration temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate 6-digit verification code
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user (not verified yet)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        referralCode: Math.random().toString(36).substring(2, 15),
        emailVerificationToken: emailVerificationCode,
        resetTokenExpiry: codeExpiry, // Reuse this field for code expiry
        emailVerified: null, // Explicitly set to null to indicate not verified
      }
    })

    // Send verification email
    try {
      await sendEmailVerificationEmail(user.email, emailVerificationCode)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Don't fail registration if email fails, but log it
    }

    // Remove sensitive data from response
    const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        data: {
          user: userWithoutSensitiveData,
          requiresVerification: true
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    // Handle specific database errors
    if (error.message?.includes("Prisma") || error.message?.includes("connect")) {
      return NextResponse.json(
        { message: "Database connection error. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}
