import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getPrismaClient } from "@/lib/prisma"
import { generateToken, generateRefreshToken } from "@/lib/auth"

// Force dynamic rendering to avoid Edge Runtime issues
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Get Prisma client lazily to avoid build-time initialization
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.user?.findUnique !== 'function') {
      return NextResponse.json(
        { message: "Login temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { message: "Please verify your email before logging in" },
        { status: 403 }
      )
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    }

    const accessToken = generateToken(tokenPayload, '24h')
    const refreshToken = generateRefreshToken(tokenPayload)

    // Remove sensitive data from response
    const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user

    return NextResponse.json(
      {
        message: "Login successful",
        data: {
          user: userWithoutSensitiveData,
          token: accessToken,
          refreshToken: rememberMe ? refreshToken : undefined
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Login error:", error)

    // Handle specific database errors
    if (error.message?.includes("Prisma") || error.message?.includes("connect")) {
      return NextResponse.json(
        { message: "Database connection error. Please try again later." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: "Login failed. Please try again." },
      { status: 500 }
    )
  }
}