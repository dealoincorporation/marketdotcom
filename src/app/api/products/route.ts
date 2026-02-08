import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-utils"
import { toCharmPrice } from "@/lib/utils/formatting"

// GET /api/products - Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const inStock = searchParams.get("inStock")

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    if (inStock !== null) {
      where.inStock = inStock === "true"
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variations: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, groupName, description, basePrice, categoryId, stock, unit, inStock, weightKg, deliveryFee, variations, images, image } = body

    if (!name || !categoryId || basePrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const normalizedImages = normalizeImageUrls(images, image)
    const primaryImage = normalizedImages.length > 0 ? normalizedImages[0] : normalizeImageUrl(image)

    const product = await prisma.product.create({
      data: {
        name,
        groupName: groupName && String(groupName).trim() ? String(groupName).trim() : null,
        description,
        basePrice: toCharmPrice(parseFloat(basePrice)),
        categoryId,
        stock: parseInt(stock) || 0,
        unit: unit || "piece",
        inStock: inStock !== undefined ? inStock : true,
        weightKg: weightKg !== undefined && weightKg !== null && weightKg !== '' ? parseFloat(weightKg) : null,
        deliveryFee: deliveryFee !== undefined ? (deliveryFee === null || deliveryFee === '' ? null : parseFloat(deliveryFee)) : null,
        image: primaryImage || undefined,
      },
      include: {
        category: true
      }
    })

    // Create variations if provided
    if (variations && variations.length > 0) {
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

          return {
            name: variationName,
            type: v.type || "Quantity",
            price: toCharmPrice(parseFloat(v.price) || 0),
            stock: typeof v.stock === "number" ? v.stock : parseInt(v.stock) || 0,
            unit: v.unit || undefined,
            quantity: parsedQuantity,
            image: normalizeImageUrl(v.image) || undefined,
            productId: product.id,
          }
        })
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
