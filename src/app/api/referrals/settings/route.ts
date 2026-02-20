import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const defaults = {
    referrerReward: "100",
    refereeReward: "50",
    isActive: true,
    description: "Refer a friend and earn rewards!",
    referrerPointsOnSignup: 0,
    referrerPointsPerPurchase: 0
  }
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
      return NextResponse.json(defaults)
    }

    return NextResponse.json({
      referrerReward: settings.referrerReward?.toString() || "100",
      refereeReward: settings.refereeReward?.toString() || "50",
      isActive: settings.isActive,
      description: settings.description,
      referrerPointsOnSignup: settings.referrerPointsOnSignup ?? 0,
      referrerPointsPerPurchase: settings.referrerPointsPerPurchase ?? 0
    })

  } catch (error: unknown) {
    console.error("Error fetching referral settings:", error)
    // When DB is unreachable (e.g. DNS/network), return defaults so app doesn't break
    const isConnectionError =
      error instanceof Error &&
      (error.name === 'PrismaClientInitializationError' ||
        /connection|DNS|ECONNREFUSED|ENOTFOUND/i.test(error.message))
    if (isConnectionError) {
      return NextResponse.json(defaults)
    }
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

    const { referrerReward, refereeReward, isActive, description, referrerPointsOnSignup, referrerPointsPerPurchase } = await request.json()

    // Find existing settings (we'll use the first one, or create if none exist)
    const existingSettings = await prisma.referralSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Store reward values as strings (can be numbers like "100" or text like "Refer a friend and earn rewards!")
    const referrerRewardValue = referrerReward?.toString().trim() || "100"
    const refereeRewardValue = refereeReward?.toString().trim() || "50"

    let settings

    if (existingSettings) {
      // Update existing settings
      settings = await prisma.referralSettings.update({
        where: {
          id: existingSettings.id
        },
        data: {
          referrerReward: referrerRewardValue,
          refereeReward: refereeRewardValue,
          isActive: Boolean(isActive),
          description: description || null,
          referrerPointsOnSignup: typeof referrerPointsOnSignup === "number" ? Math.max(0, referrerPointsOnSignup) : 0,
          referrerPointsPerPurchase: typeof referrerPointsPerPurchase === "number" ? Math.max(0, referrerPointsPerPurchase) : 0
        }
      })
    } else {
      // Create new settings
      settings = await prisma.referralSettings.create({
        data: {
          referrerReward: referrerRewardValue,
          refereeReward: refereeRewardValue,
          isActive: Boolean(isActive),
          description: description || null,
          referrerPointsOnSignup: typeof referrerPointsOnSignup === "number" ? Math.max(0, referrerPointsOnSignup) : 0,
          referrerPointsPerPurchase: typeof referrerPointsPerPurchase === "number" ? Math.max(0, referrerPointsPerPurchase) : 0
        }
      })
    }

    return NextResponse.json({
      referrerReward: settings.referrerReward || "100",
      refereeReward: settings.refereeReward || "50",
      isActive: settings.isActive,
      description: settings.description,
      referrerPointsOnSignup: settings.referrerPointsOnSignup ?? 0,
      referrerPointsPerPurchase: settings.referrerPointsPerPurchase ?? 0
    })

  } catch (error: any) {
    console.error("Error updating referral settings:", error)
    return NextResponse.json(
      { error: "Failed to update referral settings" },
      { status: 500 }
    )
  }
}