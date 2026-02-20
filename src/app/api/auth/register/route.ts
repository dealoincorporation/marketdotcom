import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getPrismaClient } from "@/lib/prisma"
import { sendEmailVerificationEmail, sendAdminUserRegistrationNotification } from "@/lib/email"
import { registerApiSchema } from "@/lib/validations/auth-api"

// Force dynamic rendering to avoid Edge Runtime issues
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using zod
    const validationResult = registerApiSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      return NextResponse.json(
        {
          message: errors[0]?.message || "Validation failed",
          errors
        },
        { status: 400 }
      )
    }

    const { name, email, phone, password, referralCode, makeAdmin } = validationResult.data

    // Special admin creation for initial setup (temporary)
    const isAdminCreation = makeAdmin && email === "marketdotcominfo@gmail.com"

    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.user?.findUnique !== 'function') {
      return NextResponse.json(
        { message: "Registration temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    // Check if referral code is provided and find referrer
    let referrer = null
    if (referralCode) {
      referrer = await prisma.user.findFirst({
        where: { referralCode: referralCode }
      })

      if (!referrer) {
        return NextResponse.json(
          { message: "Invalid referral code" },
          { status: 400 }
        )
      }
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
        role: isAdminCreation ? 'ADMIN' : 'CUSTOMER', // Assign admin role if special flag
        referralCode: Math.random().toString(36).substring(2, 15),
        referredById: referrer?.id || null,
        emailVerificationToken: emailVerificationCode,
        resetTokenExpiry: codeExpiry, // Reuse this field for code expiry
        emailVerified: null, // Explicitly set to null to indicate not verified
      }
    })

    // Create referral record if referrer exists (bonus is paid after referee's first purchase)
    if (referrer && referralCode) {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredEmail: user.email,
          code: referralCode,
          isUsed: true,
          usedAt: new Date()
        }
      })
      // Referrer and referee both receive ₦500 only after referee makes a purchase (see payment webhook/verify)
    }

    // Send verification email
    try {
      await sendEmailVerificationEmail(user.email, emailVerificationCode)
      console.log('✅ Verification email sent successfully to:', user.email)
    } catch (emailError: any) {
      console.error("❌ Failed to send verification email:", {
        error: emailError?.message || String(emailError),
        email: user.email,
        stack: emailError?.stack,
        note: 'Registration will continue, but user needs to request verification email'
      })
      // Don't fail registration if email fails, but log it for debugging
    }

    // Send admin notification
    try {
      await sendAdminUserRegistrationNotification({
        userId: user.id,
        name: user.name || 'Unknown User',
        email: user.email || 'No email provided',
        phone: user.phone || 'No phone provided',
        registrationDate: user.createdAt.toISOString(),
        referralCode: referrer ? referralCode : undefined,
        referrerName: referrer?.name || undefined
      })
    } catch (adminEmailError) {
      console.error("Failed to send admin registration notification:", adminEmailError)
      // Don't fail registration if admin email fails
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
