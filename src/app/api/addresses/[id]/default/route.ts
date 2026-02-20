import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

// PUT /api/addresses/[id]/default - Set address as default
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient()
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Unset all other default addresses for this user
      await tx.address.updateMany({
        where: {
          userId: user.userId,
          isDefault: true
        },
        data: { isDefault: false }
      })

      // Set this address as default
      await tx.address.update({
        where: { id },
        data: { isDefault: true }
      })
    })

    return NextResponse.json({
      message: "Default address updated successfully",
      addressId: id
    })
  } catch (error: any) {
    console.error("Error setting default address:", error)
    return NextResponse.json(
      { error: "Failed to set default address" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}