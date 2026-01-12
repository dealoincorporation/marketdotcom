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

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        transactionId: reference,
        userId: user.userId
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Update order based on payment status
    const paymentStatus = transactionData.status === 'success' ? 'COMPLETED' : 'FAILED'
    const orderStatus = transactionData.status === 'success' ? 'CONFIRMED' : 'CANCELLED'

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: paymentStatus,
        status: orderStatus
      }
    })

    // Create or update payment record
    await prisma.payment.upsert({
      where: { transactionId: reference },
      update: {
        status: paymentStatus,
        gatewayResponse: transactionData
      },
      create: {
        orderId: order.id,
        userId: user.userId,
        amount: transactionData.amount / 100, // Convert from kobo
        currency: "NGN",
        method: "PAYSTACK",
        status: paymentStatus,
        transactionId: reference,
        gatewayResponse: transactionData
      }
    })

    return NextResponse.json({
      success: true,
      paymentStatus: paymentStatus,
      orderStatus: orderStatus,
      transactionData: {
        reference: transactionData.reference,
        amount: transactionData.amount / 100,
        status: transactionData.status,
        paid_at: transactionData.paid_at
      }
    })

  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    )
  }
}