import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { createOrderFromPayload } from "@/lib/orderCreate"

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

    const body = await request.json()
    const {
      items,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      deliveryNotes,
      paymentMethod,
      useWallet,
      subtotal,
      deliveryFee,
      walletDeduction,
      finalTotal,
      skipEmails = false,
      slotAtCapacity = false
    } = body

    if (!items?.length || !deliveryAddress || !deliveryDate || !deliveryTime) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      )
    }

    const addressState = deliveryAddress.state?.trim().toLowerCase()
    if (addressState !== 'lagos') {
      return NextResponse.json(
        { error: "Delivery is only available in Lagos. Please use a Lagos delivery address." },
        { status: 400 }
      )
    }

    const payload = {
      items,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      deliveryNotes: deliveryNotes ?? null,
      paymentMethod,
      useWallet,
      subtotal,
      deliveryFee,
      walletDeduction: walletDeduction ?? 0,
      finalTotal,
      slotAtCapacity
    }

    const { orderId } = await createOrderFromPayload(prisma, user.userId, payload, {
      skipEmails
    })

    return NextResponse.json({
      orderId,
      message: "Order created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
