import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { z } from "zod"

function parseImagesField(imageField: unknown): string[] {
  if (typeof imageField !== "string" || !imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (!Array.isArray(parsed)) return []
    const cleaned = parsed
      .filter((v) => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
    return Array.from(new Set(cleaned)).slice(0, 10)
  } catch {
    return []
  }
}

const VariationInputSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1),
    type: z.string().optional(),
    price: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    stock: z.union([z.number(), z.string()]).transform((v) => Number.parseInt(String(v)) || 0),
    unit: z.string().optional().nullable(),
    quantity: z.union([z.number(), z.string()]).optional().nullable().transform((v) => {
      if (v === undefined || v === null || v === "") return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }),
    image: z.string().optional().nullable(),
  })
  .strict()

const ProductInputSchema = z
  .object({
    name: z.string().trim().min(1),
    groupName: z.string().optional().nullable(),
    description: z.string().optional().default(""),
    basePrice: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    categoryId: z.string().trim().min(1),
    stock: z.union([z.number(), z.string()]).transform((v) => Number.parseInt(String(v)) || 0),
    unit: z.string().optional().default("piece"),
    inStock: z.boolean().optional(),
    images: z
      .array(z.string())
      .optional()
      .default([])
      .transform((arr) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean))).slice(0, 10)),
    variations: z.array(VariationInputSchema).optional().default([]),
  })
  .strict()

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

    // Transform product to handle images array
    const transformedProduct = {
      ...product,
      images: parseImagesField(product.image)
    }

    return NextResponse.json(transformedProduct)
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
    const parsed = ProductInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product payload", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, groupName, description, basePrice, categoryId, stock, unit, images, variations } = parsed.data

    const parsedStock = stock
    const incomingVariations: any[] = variations
    const hasInStockVariation = incomingVariations.some(v => (Number.parseInt(v?.stock) || 0) > 0)
    const derivedInStock = parsedStock > 0 || hasInStockVariation

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        groupName: groupName?.trim() || null,
        description,
        basePrice: basePrice, // Already validated as number by Zod
        categoryId,
        stock: parsedStock,
        unit,
        inStock: derivedInStock,
        image: images && images.length > 0 ? JSON.stringify(images) : null,
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
      if (incomingVariations.length > 0) {
        await prisma.variation.createMany({
          data: incomingVariations.map((v: any) => ({
            name: v.name,
            type: v.type || "Size",
            price: parseFloat(v.price) || 0,
            stock: Number.parseInt(v.stock) || 0,
            unit: v.unit || null,
            quantity: v.quantity !== undefined && v.quantity !== null && v.quantity !== "" ? parseFloat(v.quantity) : null,
            image: v.image || null,
            productId: id,
          }))
        })
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variations: true },
    })

    const transformed = updated
      ? { ...updated, images: parseImagesField(updated.image) }
      : null

    return NextResponse.json(transformed ?? product)
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
    console.log('DELETE /api/products/[id] called')

    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    console.log('User from token:', user)

    if (!user) {
      console.log('No user found in token')
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      )
    }

    if (user.role !== "ADMIN") {
      console.log('User role is not ADMIN:', user.role)
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    console.log('Deleting product with ID:', id)

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

    console.log('Product deleted successfully:', id)
    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
