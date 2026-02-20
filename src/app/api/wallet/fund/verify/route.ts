import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { PaystackService } from "@/lib/paystack"
import { sendAdminWalletDepositNotification } from "@/lib/email"

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

    // Check if transaction was already processed (idempotency check)
    if (walletTransaction.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        amount: walletTransaction.amount,
        message: 'Transaction already processed',
        transactionData: {
          reference: transactionData.reference,
          amount: transactionData.amount / 100,
          status: transactionData.status,
          paid_at: transactionData.paid_at
        }
      })
    }

    const paystackStatus = String(transactionData?.status || '').toLowerCase()

    // Paystack bank transfers can remain pending/processing for a while.
    // IMPORTANT: do NOT mark our WalletTransaction as FAILED unless Paystack explicitly failed/abandoned it.
    const isSuccess = paystackStatus === 'success'
    const isTerminalFailure = paystackStatus === 'failed' || paystackStatus === 'abandoned'

    if (isSuccess) {
      // Get user data for notifications
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          name: true,
          email: true
        }
      })

      // Process atomically when supported; fallback gracefully otherwise.
      try {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.userId },
            data: {
              walletBalance: {
                increment: walletTransaction.amount
              }
            }
          }),
          prisma.walletTransaction.update({
            where: { id: walletTransaction.id },
            data: { status: "COMPLETED" }
          }),
          prisma.notification.create({
            data: {
              userId: user.userId,
              title: "Wallet Funded Successfully",
              message: `Your wallet has been credited with ₦${walletTransaction.amount.toLocaleString()}`,
              type: "WALLET"
            }
          })
        ])
      } catch (txError) {
        console.error("Wallet funding verification transaction failed, attempting non-transactional fallback:", txError)

        // Fallback order: increment wallet, then mark transaction complete, then notify.
        await prisma.user.update({
          where: { id: user.userId },
          data: {
            walletBalance: {
              increment: walletTransaction.amount
            }
          }
        })

        await prisma.walletTransaction.update({
          where: { id: walletTransaction.id },
          data: { status: "COMPLETED" }
        })

        await prisma.notification.create({
          data: {
            userId: user.userId,
            title: "Wallet Funded Successfully",
            message: `Your wallet has been credited with ₦${walletTransaction.amount.toLocaleString()}`,
            type: "WALLET"
          }
        })
      }

      // Send admin notification (non-blocking)
      try {
        await sendAdminWalletDepositNotification({
          userName: userData?.name || 'Valued Customer',
          userEmail: userData?.email || 'No email provided',
          amount: walletTransaction.amount,
          transactionId: reference
        })
      } catch (adminEmailError) {
        console.error("Failed to send admin wallet deposit notification:", adminEmailError)
        // Don't fail the deposit verification if admin email fails
      }
    } else if (isTerminalFailure) {
      await prisma.walletTransaction.update({
        where: { id: walletTransaction.id },
        data: { status: "FAILED" }
      })
    }

    return NextResponse.json({
      success: true,
      status: isSuccess ? "COMPLETED" : (isTerminalFailure ? "FAILED" : "PENDING"),
      amount: walletTransaction.amount,
      paystackStatus,
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