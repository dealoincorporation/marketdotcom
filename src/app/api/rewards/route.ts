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

    // Get points settings for conversion rates and patronage rule display
    const pointsSettings = await prisma.pointsSettings.findFirst({
      where: { isActive: true }
    }) || {
      amountThreshold: 50000,
      periodDays: 30,
      pointsPerThreshold: 1,
      pointsPerNaira: 0.01,
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
        amountThreshold: pointsSettings.amountThreshold ?? 50000,
        periodDays: (pointsSettings as any).periodDays ?? 30,
        pointsPerThreshold: pointsSettings.pointsPerThreshold ?? 1,
        pointsPerNaira: pointsSettings.pointsPerNaira ?? 0.01,
        nairaPerPoint: pointsSettings.nairaPerPoint ?? 10,
        minimumPointsToConvert: pointsSettings.minimumPointsToConvert ?? 100
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

// POST /api/rewards - Convert points to wallet (cash)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const pointsToConvert = typeof body.points === 'number' ? Math.floor(body.points) : parseInt(String(body.points || '0'), 10)
    if (!Number.isFinite(pointsToConvert) || pointsToConvert <= 0) {
      return NextResponse.json(
        { error: "Invalid points amount" },
        { status: 400 }
      )
    }

    const prisma = await getPrismaClient()

    const pointsSettings = await prisma.pointsSettings.findFirst({
      where: { isActive: true }
    })
    const nairaPerPoint = pointsSettings?.nairaPerPoint ?? 10
    const minimumPointsToConvert = pointsSettings?.minimumPointsToConvert ?? 100

    if (pointsToConvert < minimumPointsToConvert) {
      return NextResponse.json(
        { error: `Minimum points to convert is ${minimumPointsToConvert}` },
        { status: 400 }
      )
    }

    const rewards = await prisma.reward.findMany({
      where: { userId: user.userId }
    })
    const totalPoints = rewards.reduce((sum, r) => sum + r.points, 0)
    if (pointsToConvert > totalPoints) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      )
    }

    const nairaToCredit = Math.floor(pointsToConvert / nairaPerPoint)
    if (nairaToCredit < 1) {
      return NextResponse.json(
        { error: `At least ${nairaPerPoint} points required to get ₦1` },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.reward.create({
        data: {
          userId: user.userId,
          points: -pointsToConvert,
          description: `Converted ${pointsToConvert} pts to wallet (₦${nairaToCredit})`,
          type: "CONVERSION"
        }
      }),
      prisma.user.update({
        where: { id: user.userId },
        data: {
          walletBalance: { increment: nairaToCredit }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      pointsConverted: pointsToConvert,
      amountCredited: nairaToCredit
    })
  } catch (error) {
    console.error('Error converting points:', error)
    return NextResponse.json(
      { error: "Failed to convert points" },
      { status: 500 }
    )
  }
}