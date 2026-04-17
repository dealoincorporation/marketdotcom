import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const prisma = await getPrismaClient()
    if (!prisma) {
      return NextResponse.json(
        { message: "Database connection error" },
        { status: 503 }
      )
    }

    // Pull referral rows first (source of truth), then map the referred user by email.
    const referralRows = await prisma.referral.findMany({
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const referredEmails = Array.from(new Set(referralRows.map((row) => row.referredEmail.toLowerCase())))
    const referredUsers = referredEmails.length
      ? await prisma.user.findMany({
          where: {
            email: {
              in: referredEmails,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            referralCode: true,
            createdAt: true,
            emailVerified: true,
            walletBalance: true,
            referredById: true,
          },
        })
      : []

    const userByEmail = new Map(referredUsers.map((u) => [u.email.toLowerCase(), u]))

    // Keep one row per referred user email (latest referral row wins).
    const latestReferralByEmail = new Map<string, (typeof referralRows)[number]>()
    referralRows.forEach((row) => {
      const key = row.referredEmail.toLowerCase()
      if (!latestReferralByEmail.has(key)) {
        latestReferralByEmail.set(key, row)
      }
    })

    const formattedUsers = Array.from(latestReferralByEmail.entries()).map(([email, referral]) => {
      const referredUser = userByEmail.get(email)
      return {
        id: referredUser?.id || referral.id,
        name: referredUser?.name || null,
        email: referredUser?.email || referral.referredEmail,
        phone: referredUser?.phone || null,
        referralCode: referredUser?.referralCode || "",
        createdAt: referredUser?.createdAt || referral.createdAt,
        emailVerified: referredUser?.emailVerified || null,
        walletBalance: referredUser?.walletBalance || 0,
        referrer: referral.referrer
          ? {
              id: referral.referrer.id,
              name: referral.referrer.name,
              email: referral.referrer.email,
              referralCode: referral.referrer.referralCode,
            }
          : null,
        referralRecord: {
          id: referral.id,
          code: referral.code,
          isUsed: referral.isUsed,
          usedAt: referral.usedAt,
          rewardAmount: referral.rewardAmount,
          referredEmail: referral.referredEmail,
        },
      }
    })

    return NextResponse.json(
      {
        message: "Success",
        data: formattedUsers,
        total: formattedUsers.length
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error fetching referred users:", error)
    return NextResponse.json(
      { message: "Failed to fetch referred users" },
      { status: 500 }
    )
  }
}
