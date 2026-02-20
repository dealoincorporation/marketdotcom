import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { z } from "zod"

// Force dynamic rendering to avoid Edge Runtime issues
export const dynamic = 'force-dynamic'

// Validation schema for category updates
const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name too long").optional(),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal(""))
})

// GET /api/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.category?.findUnique !== 'function') {
      return NextResponse.json(
        { error: "Database temporarily unavailable" },
        { status: 503 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            stock: true,
            inStock: true
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })

  } catch (error) {
    console.error("Get category error:", error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateData = updateCategorySchema.parse(body)

    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.category?.update !== 'function') {
      return NextResponse.json(
        { error: "Database temporarily unavailable" },
        { status: 503 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Check if new name conflicts with another category
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name: updateData.name }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: "Category name already exists" },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory
    })

  } catch (error) {
    console.error("Update category error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const prisma = await getPrismaClient()

    // Check if database is available
    if (!prisma || typeof prisma.category?.findUnique !== 'function') {
      return NextResponse.json(
        { error: "Database temporarily unavailable" },
        { status: 503 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.products} products. Move or delete products first.` },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    })

  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}