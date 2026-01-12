import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { amount, method } = await request.json()

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum funding amount is ₦100" },
        { status: 400 }
      )
    }

    // In a real implementation, you would integrate with a payment gateway here
    // For now, we'll simulate successful payment and credit the wallet

    // Update wallet balance
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        walletBalance: {
          increment: amount
        }
      }
    })

    // Create wallet transaction record
    await prisma.walletTransaction.create({
      data: {
        userId: user.userId,
        type: "CREDIT",
        amount,
        method,
        description: `Wallet funded via ${method}`,
        status: "COMPLETED",
        reference: `WF${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.userId,
        title: "Wallet Funded Successfully",
        message: `Your wallet has been credited with ₦${amount.toLocaleString()}`,
        type: "WALLET"
      }
    })

    return NextResponse.json({
      message: "Wallet funded successfully",
      newBalance: updatedUser.walletBalance
    })

  } catch (error) {
    console.error("Error funding wallet:", error)
    return NextResponse.json(
      { error: "Failed to fund wallet" },
      { status: 500 }
    )
  }
}