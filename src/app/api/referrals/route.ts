import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's referral statistics
    const referralStats = await prisma.referral.aggregate({
      where: {
        referrerId: user.userId,
        isUsed: true
      },
      _count: {
        id: true
      },
      _sum: {
        rewardAmount: true
      }
    })

    // Get successful referrals (users who have verified their email)
    const successfulReferrals = await prisma.referral.count({
      where: {
        referrerId: user.userId,
        isUsed: true,
        rewardAmount: {
          gt: 0
        }
      }
    })

    // Get total earnings from referrals
    const totalEarned = referralStats._sum.rewardAmount || 0

    // Get user's referral code
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        referralCode: true
      }
    })

    const referralData = {
      code: userData?.referralCode || '',
      totalReferrals: referralStats._count.id || 0,
      successfulReferrals: successfulReferrals || 0,
      totalEarned: totalEarned
    }

    return NextResponse.json(referralData)

  } catch (error: any) {
    console.error("Error fetching referral data:", error)
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    )
  }
}