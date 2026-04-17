import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { getMissingProfileFields } from "@/lib/profile-completion"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrismaClient()
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        walletBalance: true,
        referralCode: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const missingFields = getMissingProfileFields(user)
    return NextResponse.json({
      user: {
        ...user,
        hasPassword: Boolean(user.password),
        password: undefined,
      },
      missingFields,
      needsProfileCompletion: missingFields.length > 0,
    })
  } catch (error) {
    console.error("GET /api/auth/complete-profile error:", error)
    return NextResponse.json({ message: "Failed to fetch profile completion status" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const phone = typeof body.phone === "string" ? body.phone.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (name.length < 2) {
      return NextResponse.json({ message: "Full name must be at least 2 characters." }, { status: 400 })
    }

    if (phone.length < 7) {
      return NextResponse.json({ message: "Please provide a valid phone number." }, { status: 400 })
    }

    if (password && password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 })
    }

    const prisma = await getPrismaClient()
    const existingUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, password: true },
    })

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const updateData: { name: string; phone: string; password?: string } = {
      name,
      phone,
    }

    if (password) {
      updateData.password = await hashPassword(password)
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        walletBalance: true,
        referralCode: true,
        password: true,
      },
    })

    const missingFields = getMissingProfileFields(updatedUser)
    return NextResponse.json({
      message: "Profile completed successfully.",
      user: {
        ...updatedUser,
        hasPassword: Boolean(updatedUser.password),
        password: undefined,
      },
      missingFields,
      needsProfileCompletion: missingFields.length > 0,
    })
  } catch (error) {
    console.error("PUT /api/auth/complete-profile error:", error)
    return NextResponse.json({ message: "Failed to complete profile" }, { status: 500 })
  }
}
