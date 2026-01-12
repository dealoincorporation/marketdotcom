import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = await getPrismaClient()
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variations: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product (Admin only)
export async function PUT(
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
    const { name, description, basePrice, categoryId, stock, unit, inStock, variations } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        basePrice: parseFloat(basePrice),
        categoryId,
        stock: parseInt(stock),
        unit,
        inStock,
      },
      include: {
        category: true,
        variations: true
      }
    })

    // Update variations if provided
    if (variations) {
      // Delete existing variations
      await prisma.variation.deleteMany({
        where: { productId: id }
      })

      // Create new variations
      if (variations.length > 0) {
        await prisma.variation.createMany({
          data: variations.map((v: any) => ({
            name: v.name,
            type: v.type || "Size",
            price: parseFloat(v.price) || 0,
            productId: id,
          }))
        })
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product (Admin only)
export async function DELETE(
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

    // Delete variations first
    await prisma.variation.deleteMany({
      where: { productId: id }
    })

    // Delete cart items that reference this product
    await prisma.cartItem.deleteMany({
      where: { productId: id }
    })

    // Delete order items that reference this product
    await prisma.orderItem.deleteMany({
      where: { productId: id }
    })

    // Delete the product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
