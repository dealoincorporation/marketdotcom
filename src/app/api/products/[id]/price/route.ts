import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { toCharmPrice } from "@/lib/utils/formatting"

// POST /api/products/[id]/price - Update product price (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { price, startDate, endDate } = body

    if (!price || isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      )
    }

    // For now, we'll just update the basePrice directly
    // TODO: If price history/promotional pricing is needed, add a PriceHistory model to schema
    const product = await prisma.product.update({
      where: { id },
      data: {
        basePrice: toCharmPrice(parseFloat(price)),
      },
      include: {
        category: true,
        variations: true
      }
    })

    return NextResponse.json({
      success: true,
      product,
      message: "Price updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating product price:", error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update product price" },
      { status: 500 }
    )
  }
}
