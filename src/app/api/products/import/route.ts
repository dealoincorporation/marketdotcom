import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { toCharmPrice } from "@/lib/utils/formatting"

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

    const products = await request.json()

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: "Products must be an array" },
        { status: 400 }
      )
    }

    const createdProducts = []
    const errors = []

    for (const productData of products) {
      try {
        const { name, description, basePrice, categoryId, stock, unit, inStock, variations } = productData

        // Validate required fields
        if (!name || !categoryId || basePrice === undefined || stock === undefined || !unit) {
          errors.push({ product: name || 'Unknown', error: 'Missing required fields' })
          continue
        }

        // Check if category exists
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        })

        if (!category) {
          errors.push({ product: name, error: `Category with ID ${categoryId} not found` })
          continue
        }

        // Check if product with same name already exists
        const existingProduct = await prisma.product.findFirst({
          where: { name: name }
        })

        if (existingProduct) {
          errors.push({ product: name, error: 'Product with this name already exists' })
          continue
        }

        // Create the product
        const newProduct = await prisma.product.create({
          data: {
            name,
            description: description || '',
            basePrice: toCharmPrice(parseFloat(basePrice)),
            categoryId,
            stock: parseInt(stock),
            unit,
            inStock: inStock !== undefined ? inStock : true,
          },
          include: {
            category: true,
            variations: true
          }
        })

        createdProducts.push(newProduct)
      } catch (error: any) {
        errors.push({
          product: productData.name || 'Unknown',
          error: error.message || 'Failed to create product'
        })
      }
    }

    return NextResponse.json({
      success: true,
      created: createdProducts.length,
      errors: errors.length,
      products: createdProducts,
      errorDetails: errors
    })

  } catch (error) {
    console.error("Import products error:", error)
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    )
  }
}