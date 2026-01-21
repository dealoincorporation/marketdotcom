import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()

    // Get the first (and typically only) referral settings record
    const settings = await prisma.referralSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        referrerReward: 100,
        refereeReward: 50,
        isActive: true,
        description: "Refer a friend and earn rewards!"
      })
    }

    return NextResponse.json({
      referrerReward: settings.referrerReward,
      refereeReward: settings.refereeReward,
      isActive: settings.isActive,
      description: settings.description
    })

  } catch (error: any) {
    console.error("Error fetching referral settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch referral settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { referrerReward, refereeReward, isActive, description } = await request.json()

    // Update or create referral settings
    const settings = await prisma.referralSettings.upsert({
      where: {
        id: "default" // Use a fixed ID for the main settings
      },
      update: {
        referrerReward: parseFloat(referrerReward) || 100,
        refereeReward: parseFloat(refereeReward) || 50,
        isActive: Boolean(isActive),
        description: description || null
      },
      create: {
        id: "default",
        referrerReward: parseFloat(referrerReward) || 100,
        refereeReward: parseFloat(refereeReward) || 50,
        isActive: Boolean(isActive),
        description: description || null
      }
    })

    return NextResponse.json({
      referrerReward: settings.referrerReward,
      refereeReward: settings.refereeReward,
      isActive: settings.isActive,
      description: settings.description
    })

  } catch (error: any) {
    console.error("Error updating referral settings:", error)
    return NextResponse.json(
      { error: "Failed to update referral settings" },
      { status: 500 }
    )
  }
}