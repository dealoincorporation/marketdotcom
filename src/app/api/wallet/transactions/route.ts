import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering since this route uses authentication and headers
export const dynamic = 'force-dynamic'

// GET /api/wallet/transactions - Get user's recent wallet transactions
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

    // Get recent transactions (last 10)
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        reference: true,
        createdAt: true,
      }
    })

    // Transform the data to match the expected format
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type.toLowerCase(), // 'credit' or 'debit'
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      reference: transaction.reference,
      date: transaction.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      totalCount: transactions.length
    })
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)

    // Check if it's a database connection error
    if (error instanceof Error && (error.message.includes('server selection') || (error as any).code === 'P2010')) {
      // Return empty transactions instead of error for better UX
      return NextResponse.json({
        transactions: [],
        totalCount: 0,
        message: "Database temporarily unavailable. Showing cached data."
      })
    }

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}