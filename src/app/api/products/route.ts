import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { z } from "zod"

// Force dynamic rendering since this route uses authentication and headers
export const dynamic = 'force-dynamic'

function parseImagesField(imageField: unknown): string[] {
  if (typeof imageField !== "string" || !imageField) return []
  try {
    const parsed = JSON.parse(imageField)
    if (!Array.isArray(parsed)) return []
    const cleaned = parsed
      .filter((v) => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
    // Avoid UI explosions if bad data gets stored (e.g. stock count accidentally becomes images length).
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

    // Transform products to handle images array
    const transformedProducts = products.map(product => ({
      ...product,
      images: parseImagesField(product.image)
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)

    // Check if it's a database connection error
    if (error instanceof Error && (error.message.includes('server selection') || (error as any).code === 'P2010')) {
      // Return sample products for better UX
      const sampleProducts = [
        {
          id: "sample-1",
          name: "Fresh Tomatoes",
          description: "Organic red tomatoes, perfect for salads and cooking",
          basePrice: 2500,
          categoryId: "vegetables",
          category: { id: "vegetables", name: "🥕 Vegetables" },
          images: ["/api/placeholder/300/200"],
          stock: 50,
          unit: "kg",
          inStock: true,
          variations: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "sample-2",
          name: "Premium Rice",
          description: "Long grain white rice, imported quality",
          basePrice: 8500,
          categoryId: "grains",
          category: { id: "grains", name: "🌾 Grains & Cereals" },
          images: ["/api/placeholder/300/200"],
          stock: 100,
          unit: "bag",
          inStock: true,
          variations: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      return NextResponse.json(sampleProducts)
    }

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
      console.log('Authentication failed - user:', user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.email)

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

    // Always derive inStock from actual inventory to avoid inconsistent UI states.
    const derivedInStock = parsedStock > 0 || hasInStockVariation

    // Ensure the category exists, create it if it doesn't
    let category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      // Create the category if it doesn't exist
      const categoryNames: Record<string, string> = {
        'fruits': '🍎 Fruits',
        'vegetables': '🥕 Vegetables',
        'grains': '🌾 Grains & Cereals',
        'proteins': '🥩 Proteins',
        'dairy': '🥛 Dairy',
        'beverages': '🥤 Beverages',
        'snacks': '🍿 Snacks',
        'spices': '🌿 Spices & Seasonings',
        'bakery': '🍞 Bakery',
        'frozen': '🧊 Frozen Foods',
        'canned': '🥫 Canned Goods',
        'organic': '🌱 Organic Products'
      }

      const categoryName = categoryNames[categoryId] || categoryId
      category = await prisma.category.create({
        data: {
          id: categoryId,
          name: categoryName,
          description: `${categoryName} category`
        }
      })
    }

    const product = await prisma.product.create({
      data: {
        name,
        groupName: groupName?.trim() || null,
        description,
        basePrice: basePrice, // Already validated as number by Zod
        categoryId,
        stock: parsedStock,
        unit: unit || "piece",
        inStock: derivedInStock,
        image: images && images.length > 0 ? JSON.stringify(images) : null,
      },
      include: {
        category: true
      }
    })

    // Create variations if provided
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
          productId: product.id,
        }))
      })
    }

    // Return the created product with variations so the UI can reflect inventory immediately.
    const created = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, variations: true },
    })

    const transformed = created
      ? { ...created, images: parseImagesField(created.image) }
      : null

    return NextResponse.json(transformed ?? product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
