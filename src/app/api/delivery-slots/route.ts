import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { isSlotDateToday, isSlotStartInPast } from "@/lib/delivery-slots"

// GET /api/delivery-slots - Get all available delivery slots (including today, from current time)
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()

    // Start of today (local) so we include today's slots
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

    const slots = await prisma.deliverySlot.findMany({
      where: {
        isAvailable: true,
        date: {
          gte: startOfToday
        }
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ]
    })

    // For slots on today, hide time slots whose start time has already passed
    const filtered = slots.filter((slot) => {
      const slotDate = new Date(slot.date)
      if (isSlotDateToday(slotDate, now) && isSlotStartInPast(slotDate, slot.timeSlot, now)) {
        return false
      }
      return true
    })

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Error fetching delivery slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch delivery slots" },
      { status: 500 }
    )
  }
}

// POST /api/delivery-slots - Create a new delivery slot (Admin only)
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { date, timeSlot, maxOrders, price, description } = await request.json()

    // Validate required fields
    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: "Date and time slot are required" },
        { status: 400 }
      )
    }

    const slot = await prisma.deliverySlot.create({
      data: {
        date: new Date(date),
        timeSlot,
        maxOrders: maxOrders || 10,
        price: price || null,
        description: description || null
      }
    })

    await prisma.notification.create({
      data: {
        userId: user.userId,
        title: "New delivery slot added",
        message: `Delivery slot for ${new Date(date).toLocaleDateString()} (${timeSlot}) has been created.`,
        type: "DELIVERY",
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error: any) {
    console.error("Error creating delivery slot:", error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A slot already exists for this date and time" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create delivery slot" },
      { status: 500 }
    )
  }
}