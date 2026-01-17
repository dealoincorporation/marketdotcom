import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

// GET /api/rewards - Get user's rewards and points
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const prisma = await getPrismaClient()

    // Get all rewards for the user
    const rewards = await prisma.reward.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent rewards
    })

    // Calculate total points from rewards
    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0)

    // Calculate tier based on points
    const tier = Math.floor(totalPoints / 1000) + 1
    const tierName = tier === 1 ? 'Bronze' : tier === 2 ? 'Silver' : tier === 3 ? 'Gold' : 'Platinum'
    const pointsToNextTier = tier * 1000 - totalPoints

    // Get points settings for conversion rates
    const pointsSettings = await prisma.pointsSettings.findFirst({
      where: { isActive: true }
    }) || {
      pointsPerNaira: 0.1,
      nairaPerPoint: 10,
      minimumPointsToConvert: 100
    }

    return NextResponse.json({
      totalPoints,
      tier,
      tierName,
      pointsToNextTier,
      rewards: rewards.map(reward => ({
        id: reward.id,
        points: reward.points,
        description: reward.description,
        type: reward.type,
        createdAt: reward.createdAt
      })),
      pointsSettings: {
        pointsPerNaira: pointsSettings.pointsPerNaira,
        nairaPerPoint: pointsSettings.nairaPerPoint,
        minimumPointsToConvert: pointsSettings.minimumPointsToConvert
      }
    })

  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    )
  }
}