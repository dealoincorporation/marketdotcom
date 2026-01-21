import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

// GET /api/addresses/[id] - Get specific address
export async function GET(
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

    return NextResponse.json(address)
  } catch (error: any) {
    console.error("Error fetching address:", error)
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/addresses/[id] - Update address
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
    const body = await request.json()

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    const {
      type,
      name,
      address,
      city,
      state,
      postalCode,
      phone,
      isDefault,
      deliveryNotes,
      coordinates
    } = body

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.userId,
          isDefault: true,
          id: { not: id } // Exclude current address
        },
        data: { isDefault: false }
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        type,
        name,
        address,
        city,
        state,
        postalCode,
        phone,
        isDefault,
        deliveryNotes,
        coordinates: coordinates ? JSON.stringify(coordinates) : undefined
      }
    })

    return NextResponse.json(updatedAddress)
  } catch (error: any) {
    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
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

    // Check if this is the default address and there are others
    if (address.isDefault) {
      const otherAddresses = await prisma.address.count({
        where: {
          userId: user.userId,
          id: { not: id }
        }
      })

      // If there are other addresses, make the first one default
      if (otherAddresses > 0) {
        const firstAddress = await prisma.address.findFirst({
          where: {
            userId: user.userId,
            id: { not: id }
          },
          orderBy: { createdAt: 'asc' }
        })

        if (firstAddress) {
          await prisma.address.update({
            where: { id: firstAddress.id },
            data: { isDefault: true }
          })
        }
      }
    }

    await prisma.address.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}