import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { PaystackService } from "@/lib/paystack"

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

    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      )
    }

    // Verify the payment with Paystack
    const paystackResponse = await PaystackService.verifyTransaction(reference)

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      )
    }

    const transactionData = paystackResponse.data

    // Find the wallet transaction
    const walletTransaction = await prisma.walletTransaction.findFirst({
      where: {
        reference: reference,
        userId: user.userId,
        type: "CREDIT"
      }
    })

    if (!walletTransaction) {
      return NextResponse.json(
        { error: "Wallet transaction not found" },
        { status: 404 }
      )
    }

    // Update transaction and wallet balance based on payment status
    const transactionStatus = transactionData.status === 'success' ? 'COMPLETED' : 'FAILED'

    if (transactionStatus === 'COMPLETED') {
      // Update wallet balance
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          walletBalance: {
            increment: walletTransaction.amount
          }
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: user.userId,
          title: "Wallet Funded Successfully",
          message: `Your wallet has been credited with ₦${walletTransaction.amount.toLocaleString()}`,
          type: "WALLET"
        }
      })
    }

    // Update wallet transaction status
    await prisma.walletTransaction.update({
      where: { id: walletTransaction.id },
      data: {
        status: transactionStatus
      }
    })

    return NextResponse.json({
      success: true,
      status: transactionStatus,
      amount: walletTransaction.amount,
      transactionData: {
        reference: transactionData.reference,
        amount: transactionData.amount / 100,
        status: transactionData.status,
        paid_at: transactionData.paid_at
      }
    })

  } catch (error: any) {
    console.error("Error verifying wallet funding:", error)
    return NextResponse.json(
      { error: "Failed to verify wallet funding", details: error.message },
      { status: 500 }
    )
  }
}