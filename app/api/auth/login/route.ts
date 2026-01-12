import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    let body
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const data = loginSchema.parse(body)

    // Get prisma client
    const prisma = await getPrismaClient()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Account setup incomplete' },
        { status: 500 }
      )
    }
    const isValid = await comparePassword(data.password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email before logging in. Check your email for the verification link.',
          requiresVerification: true,
        },
        { status: 403 }
      )
    }

    // Generate access token with expiration based on remember me
    const expiresIn = data.rememberMe ? '30d' : '7d'
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    }, expiresIn)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token: accessToken,
        rememberMe: data.rememberMe,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}