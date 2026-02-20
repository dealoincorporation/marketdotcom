import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { comparePassword, hashPassword } from "@/lib/auth"

// This route uses request headers for authentication, so it must be dynamic
export const dynamic = 'force-dynamic'

// POST /api/profile/change-password - Change user's password
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    const prisma = await getPrismaClient()

    // Get user with password hash
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    if (!userRecord.password) {
      return NextResponse.json(
        { error: "Password not set. Please use password reset." },
        { status: 400 }
      )
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      userRecord.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        password: hashedNewPassword,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("POST /api/profile/change-password error:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
