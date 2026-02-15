import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-utils"
import { toCharmPrice } from "@/lib/utils/formatting"

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
    const { name, groupName, description, basePrice, categoryId, stock, unit, inStock, weightKg, deliveryFee, variations, images, image } = body

    const normalizedImages = normalizeImageUrls(images, image)
    const primaryImage = normalizedImages.length > 0 ? normalizedImages[0] : normalizeImageUrl(image)

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        groupName: groupName !== undefined ? (groupName && String(groupName).trim() ? String(groupName).trim() : null) : undefined,
        description,
        basePrice: toCharmPrice(parseFloat(basePrice)),
        categoryId,
        stock: parseInt(stock),
        unit,
        inStock,
        weightKg: weightKg !== undefined ? (weightKg === null || weightKg === '' ? null : parseFloat(weightKg)) : undefined,
        deliveryFee: deliveryFee !== undefined ? (deliveryFee === null || deliveryFee === '' ? null : parseFloat(deliveryFee)) : undefined,
        image: primaryImage || undefined,
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
          data: variations.map((v: any) => {
            // Store the full quantity string (e.g., "2 cartons") in the name field for display
            // This preserves both numbers and letters as entered by the user
            const variationName = v.quantity 
              ? String(v.quantity)  // Preserves full string like "2 cartons"
              : v.name || `Variation ${variations.indexOf(v) + 1}`
            
            // Extract numeric value from quantity for calculations/sorting (e.g., "2 cartons" -> 2)
            // The name field above stores the full string, while quantity stores just the number
            let parsedQuantity: number | undefined = undefined
            if (v.quantity !== null && v.quantity !== undefined && v.quantity !== '') {
              const numValue = typeof v.quantity === 'string' 
                ? parseFloat(v.quantity.replace(/[^\d.]/g, '')) 
                : Number(v.quantity)
              if (!isNaN(numValue)) {
                parsedQuantity = numValue
              }
            }

            const weightKg =
              v.weightKg !== undefined && v.weightKg !== null && v.weightKg !== ""
                ? parseFloat(String(v.weightKg))
                : null

            return {
              name: variationName,
              type: v.type || "Quantity",
              price: toCharmPrice(parseFloat(v.price) || 0),
              stock: typeof v.stock === "number" ? v.stock : parseInt(v.stock) || 0,
              unit: v.unit || undefined,
              quantity: parsedQuantity,
              weightKg: Number.isNaN(weightKg) ? null : weightKg,
              image: normalizeImageUrl(v.image) || undefined,
              productId: id,
            }
          })
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
