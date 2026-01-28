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

    // Get all users who signed up through referrals (have referredById)
    const referredUsers = await prisma.user.findMany({
      where: {
        referredById: {
          not: null
        }
      },
      include: {
        referredBy: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true
          }
        },
        referredReferrals: {
          select: {
            id: true,
            code: true,
            isUsed: true,
            usedAt: true,
            rewardAmount: true,
            referredEmail: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedUsers = referredUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      walletBalance: user.walletBalance,
      referrer: user.referredBy ? {
        id: user.referredBy.id,
        name: user.referredBy.name,
        email: user.referredBy.email,
        referralCode: user.referredBy.referralCode
      } : null,
      referralRecord: user.referredReferrals[0] || null
    }))

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
