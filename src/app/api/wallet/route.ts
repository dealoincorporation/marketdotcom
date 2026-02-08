import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { generateReferralCode } from "@/lib/helpers/index"

// Force dynamic rendering since this route uses authentication and headers
export const dynamic = 'force-dynamic'

// GET /api/wallet - Get user's wallet info
export async function GET(request: Request) {
  try {
    const prisma = await getPrismaClient()
    const authUser = getUserFromRequest(request)

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        walletBalance: true,
        points: true,
        referralCode: true,
        _count: {
          select: {
            referrals: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Generate referral code if user doesn't have one
    if (!user.referralCode) {
      const newReferralCode = generateReferralCode()
      const updatedUser = await prisma.user.update({
        where: { id: authUser.userId },
        data: { referralCode: newReferralCode },
        select: {
          id: true,
          walletBalance: true,
          points: true,
          referralCode: true,
          _count: {
            select: {
              referrals: true
            }
          }
        }
      })
      user = updatedUser
    }

    return NextResponse.json({
      walletBalance: user.walletBalance,
      points: user.points,
      referralCode: user.referralCode,
      referralCount: user._count.referrals
    })
  } catch (error) {
    console.error("Error fetching wallet info:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet info" },
      { status: 500 }
    )
  }
}

// POST /api/wallet/fund - Fund wallet (simulated payment)
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const authUser = getUserFromRequest(request)

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    // In a real app, this would integrate with a payment provider
    // For now, we'll simulate adding funds to the wallet
    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        walletBalance: {
          increment: parseFloat(amount)
        }
      },
      select: {
        id: true,
        walletBalance: true
      }
    })

    // Create a reward record for the funding
    await prisma.reward.create({
      data: {
        userId: authUser.userId,
        points: 0, // Could add bonus points for funding
        description: `Wallet funded with ₦${amount}`,
        type: "FUNDING"
      }
    })

    return NextResponse.json({
      message: "Wallet funded successfully",
      walletBalance: user.walletBalance
    })
  } catch (error) {
    console.error("Error funding wallet:", error)
    return NextResponse.json(
      { error: "Failed to fund wallet" },
      { status: 500 }
    )
  }
}
