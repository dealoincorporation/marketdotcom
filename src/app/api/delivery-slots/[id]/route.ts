import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// GET /api/delivery-slots/[id] - Get a specific delivery slot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = await getPrismaClient()
    const { id } = await params

    const slot = await prisma.deliverySlot.findUnique({
      where: { id }
    })

    if (!slot) {
      return NextResponse.json(
        { error: "Delivery slot not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(slot)
  } catch (error) {
    console.error("Error fetching delivery slot:", error)
    return NextResponse.json(
      { error: "Failed to fetch delivery slot" },
      { status: 500 }
    )
  }
}

// PUT /api/delivery-slots/[id] - Update a delivery slot (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    const { date, timeSlot, isAvailable, maxOrders, currentOrders, price, description } = await request.json()

    const slot = await prisma.deliverySlot.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(timeSlot && { timeSlot }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(maxOrders !== undefined && { maxOrders }),
        ...(currentOrders !== undefined && { currentOrders }),
        ...(price !== undefined && { price }),
        ...(description !== undefined && { description })
      }
    })

    await prisma.notification.create({
      data: {
        userId: user.userId,
        title: "Delivery slot updated",
        message: `Delivery slot for ${new Date(slot.date).toLocaleDateString()} (${slot.timeSlot}) has been updated.`,
        type: "DELIVERY",
      },
    })

    return NextResponse.json(slot)
  } catch (error: any) {
    console.error("Error updating delivery slot:", error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Delivery slot not found" },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A slot already exists for this date and time" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update delivery slot" },
      { status: 500 }
    )
  }
}

// DELETE /api/delivery-slots/[id] - Delete a delivery slot (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if slot has any scheduled orders
    const slot = await prisma.deliverySlot.findUnique({
      where: { id },
      select: { currentOrders: true }
    })

    if (!slot) {
      return NextResponse.json(
        { error: "Delivery slot not found" },
        { status: 404 }
      )
    }

    if (slot.currentOrders > 0) {
      return NextResponse.json(
        { error: "Cannot delete slot with scheduled orders. Cancel orders first." },
        { status: 409 }
      )
    }

    await prisma.deliverySlot.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Delivery slot deleted successfully" })
  } catch (error) {
    console.error("Error deleting delivery slot:", error)
    return NextResponse.json(
      { error: "Failed to delete delivery slot" },
      { status: 500 }
    )
  }
}