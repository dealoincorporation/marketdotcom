import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { PaystackService, generateReference } from "@/lib/paystack"

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

    const { orderId, amount, paymentMethod } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    let order = null

    // For Paystack payments, orderId is optional (we create order after payment)
    // For other payment methods, orderId is required
    if (orderId) {
      // Verify the order exists and belongs to the user
      order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: user.userId,
          paymentStatus: "PENDING"
        }
      })

      if (!order) {
        return NextResponse.json(
          { error: "Order not found or already paid" },
          { status: 404 }
        )
      }
    } else if (paymentMethod !== 'paystack') {
      // For non-Paystack payments, orderId is required
      return NextResponse.json(
        { error: "Order ID is required for this payment method" },
        { status: 400 }
      )
    }

    // DUPLICATE PREVENTION: Check if order already has a pending payment
    if (orderId && order) {
      // Check if there's already a payment in progress for this order
      const existingPayment = await prisma.payment.findFirst({
        where: {
          orderId: orderId,
          status: { in: ["PENDING", "COMPLETED"] }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (existingPayment && existingPayment.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Order has already been paid" },
          { status: 400 }
        )
      }

      // If there's a pending payment, reuse the reference
      if (existingPayment && existingPayment.status === "PENDING") {
        const reference = existingPayment.transactionId
        // Verify payment status with Paystack
        const verifyResponse = await PaystackService.verifyTransaction(reference)
        if (verifyResponse.status && verifyResponse.data.status === 'success') {
          return NextResponse.json(
            { error: "Payment already in progress. Please complete the existing payment." },
            { status: 400 }
          )
        }
        // If payment failed or expired, continue with new reference
      }
    }

    // Generate unique reference
    const reference = generateReference()

    // Update order with transaction reference (only if order exists)
    if (orderId && order) {
      console.log('Updating order with transaction reference:', { orderId, reference })
      await prisma.order.update({
        where: { id: orderId },
        data: {
          transactionId: reference,
          paymentMethod: paymentMethod || "paystack"
        }
      })
      console.log('Order updated with transaction reference successfully')
    } else {
      console.warn('Order not found or orderId missing:', { orderId, orderFound: !!order })
    }

    // Initialize Paystack transaction
    const paystackResponse = await PaystackService.initializeTransaction({
      amount: amount,
      email: user.email || "",
      reference: reference,
      callback_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://marketdotcom.ng' : 'http://localhost:3000')}/checkout?reference=${reference}`,
      metadata: {
        orderId: orderId || null,
        userId: user.userId,
        custom_fields: orderId ? [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: orderId
          }
        ] : []
      }
    })

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reference: reference,
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code
    })

  } catch (error: any) {
    console.error("Error initializing payment:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment", details: error.message },
      { status: 500 }
    )
  }
}