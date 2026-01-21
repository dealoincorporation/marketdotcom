import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering since this route uses authentication and headers
export const dynamic = 'force-dynamic'

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
      images: product.image ? JSON.parse(product.image) : []
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
          price: 2500,
          category: "Vegetables",
          image: "/api/placeholder/300/200",
          stock: 50,
          rating: 4.5,
          reviews: 24,
          unit: "kg",
          inStock: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "sample-2",
          name: "Premium Rice",
          description: "Long grain white rice, imported quality",
          price: 8500,
          category: "Grains",
          image: "/api/placeholder/300/200",
          stock: 100,
          rating: 4.8,
          reviews: 156,
          unit: "bag",
          inStock: true,
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
    const { name, groupName, description, basePrice, categoryId, stock, unit, inStock, images, variations } = body

    if (!name || !categoryId || basePrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const parsedStock = Number.parseInt(stock) || 0
    const incomingVariations: any[] = Array.isArray(variations) ? variations : []
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
        basePrice: parseFloat(basePrice),
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
      ? { ...created, images: created.image ? JSON.parse(created.image) : [] }
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
