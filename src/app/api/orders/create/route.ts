import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { createOrderFromPayload } from "@/lib/orderCreate"

/** Round to 2 decimal places to prevent floating-point drift */
function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

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
      subtotal: clientSubtotal,
      deliveryFee,
      walletDeduction,
      finalTotal: clientFinalTotal,
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

    // ── Server-side price & stock re-validation ──────────────────────
    const productIds = Array.from(
      new Set((items as any[]).map((i) => String(i.productId)))
    ) as string[]
    const variationIds = (items as any[])
      .filter((i) => i.variationId)
      .map((i) => String(i.variationId)) as string[]

    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const variations = variationIds.length > 0
      ? await prisma.variation.findMany({ where: { id: { in: variationIds } } })
      : []

    const productMap = new Map(products.map((p) => [p.id, p]))
    const variationMap = new Map(variations.map((v) => [v.id, v]))

    let serverSubtotal = 0
    const verifiedItems: typeof items = []

    for (const item of items as Array<{
      productId: string
      variationId?: string | null
      name?: string
      quantity: number
      unitPrice: number
      totalPrice: number
      unit?: string
    }>) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.name || item.productId}` },
          { status: 400 }
        )
      }

      const variation = item.variationId ? variationMap.get(item.variationId) : null
      const currentPrice = variation ? variation.price : product.basePrice
      const currentStock = variation ? variation.stock : product.stock
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))

      if (currentStock < qty) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.name || product.name}. Available: ${currentStock}, requested: ${qty}`,
          },
          { status: 400 }
        )
      }

      if (!product.inStock) {
        return NextResponse.json(
          { error: `${item.name || product.name} is currently out of stock` },
          { status: 400 }
        )
      }

      const lineTotal = roundCurrency(currentPrice * qty)
      serverSubtotal = roundCurrency(serverSubtotal + lineTotal)

      verifiedItems.push({
        ...item,
        quantity: qty,
        unitPrice: currentPrice,
        totalPrice: lineTotal,
      })
    }

    // Allow a small tolerance (1 naira) for floating-point rounding across client/server
    const subtotalDrift = Math.abs(serverSubtotal - (clientSubtotal ?? 0))
    const subtotal = serverSubtotal
    const finalTotal = Math.max(0, roundCurrency(subtotal + deliveryFee - (walletDeduction ?? 0)))

    if (subtotalDrift > 1) {
      console.warn(
        `Subtotal mismatch: client=${clientSubtotal}, server=${serverSubtotal}, drift=${subtotalDrift}`
      )
    }
    // ── End validation ───────────────────────────────────────────────

    const payload = {
      items: verifiedItems,
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
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    )
  }
}
