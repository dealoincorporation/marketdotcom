import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-utils"

// This route uses request headers for authentication, so it must be dynamic
export const dynamic = 'force-dynamic'

function cartItemId(productId: string, variationId?: string | null): string {
  return variationId ? `${productId}-${variationId}` : `${productId}-base`
}

// GET /api/cart - Fetch current user's cart (auth required)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = await getPrismaClient()
    const cart = await prisma.cart.findFirst({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
            variation: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const items = cart.items.map((ci) => {
      const p = ci.product
      const v = ci.variation
      const images = normalizeImageUrls(p.image)
      const img = images[0] || "/market_image.jpeg"
      const price = v ? v.price : p.basePrice
      const unit = (v?.unit || p.unit) as string
      const stock = v ? v.stock : p.stock
      const name = v
        ? `${p.name} - ${v.quantity ?? ""}${v.unit ?? ""} ${v.name}`.replace(/\s+/g, " ").trim()
        : p.name

      return {
        id: cartItemId(p.id, ci.variationId),
        productId: p.id,
        variationId: ci.variationId ?? undefined,
        name,
        price,
        image: img,
        quantity: ci.quantity,
        unit,
        weight: (v?.weightKg ?? p.weightKg) ?? 0,
        deliveryFee: p.deliveryFee ?? null,
        variation: v
          ? {
              id: v.id,
              name: v.name,
              type: v.type,
              price: v.price,
              stock: v.stock,
              quantity: v.quantity ?? undefined,
              unit: v.unit ?? undefined,
            }
          : undefined,
        categoryId: p.categoryId,
        categoryName: p.category?.name,
        isAvailable: stock > 0,
        maxQuantity: stock,
        addedAt: ci.createdAt,
        updatedAt: ci.updatedAt,
      }
    })

    return NextResponse.json({ items })
  } catch (e) {
    console.error("GET /api/cart error:", e)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

// PUT /api/cart - Replace user's cart (auth required)
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const raw = body.items as Array<{ productId: string; variationId?: string | null; quantity: number }>
    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: "Invalid body: items array required" }, { status: 400 })
    }

    const prisma = await getPrismaClient()
    let cart = await prisma.cart.findFirst({
      where: { userId: user.userId },
      include: { items: true },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.userId },
        include: { items: true },
      })
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    if (raw.length > 0) {
      await prisma.cartItem.createMany({
        data: raw.map((i) => ({
          cartId: cart!.id,
          productId: i.productId,
          variationId: i.variationId ?? null,
          quantity: Math.max(1, Math.min(999, Number(i.quantity) || 1)),
        })),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("PUT /api/cart error:", e)
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    )
  }
}
