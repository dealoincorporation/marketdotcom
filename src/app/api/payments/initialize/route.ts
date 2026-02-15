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

    const { orderId, amount, paymentMethod, orderData } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    let order = null
    const reference = generateReference()

    // Paystack: create order ONLY after payment. Pass orderData and we store PendingCheckout.
    // No orderId means we do not create an order until payment is verified.
    if (paymentMethod === 'paystack' && !orderId && orderData) {
      await prisma.pendingCheckout.create({
        data: {
          reference,
          userId: user.userId,
          amount,
          orderData: orderData as object
        }
      })
      const paystackResponse = await PaystackService.initializeTransaction({
        amount: amount,
        email: user.email || "",
        reference: reference,
        callback_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://marketdotcom.ng' : 'http://localhost:3000')}/checkout?reference=${reference}`,
        metadata: {
          userId: user.userId,
          custom_fields: [{ display_name: "Reference", variable_name: "reference", value: reference }]
        }
      })
      if (!paystackResponse.status) {
        await prisma.pendingCheckout.deleteMany({ where: { reference } }).catch(() => {})
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
    }

    // Legacy or other: orderId required (order already exists)
    if (orderId) {
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
    } else {
      return NextResponse.json(
        { error: "Order ID or orderData (for Paystack) is required" },
        { status: 400 }
      )
    }

    // DUPLICATE PREVENTION
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
        status: { in: ["PENDING", "COMPLETED"] }
      },
      orderBy: { createdAt: 'desc' }
    })
    if (existingPayment?.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Order has already been paid" },
        { status: 400 }
      )
    }
    if (existingPayment?.status === "PENDING") {
      const verifyResponse = await PaystackService.verifyTransaction(existingPayment.transactionId)
      if (verifyResponse.status && verifyResponse.data?.status === 'success') {
        return NextResponse.json(
          { error: "Payment already in progress. Please complete the existing payment." },
          { status: 400 }
        )
      }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        transactionId: reference,
        paymentMethod: paymentMethod || "paystack"
      }
    })

    const paystackResponse = await PaystackService.initializeTransaction({
      amount: amount,
      email: user.email || "",
      reference: reference,
      callback_url: `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://marketdotcom.ng' : 'http://localhost:3000')}/checkout?reference=${reference}`,
      metadata: {
        orderId: orderId,
        userId: user.userId,
        custom_fields: [{ display_name: "Order ID", variable_name: "order_id", value: orderId }]
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