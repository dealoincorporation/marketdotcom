import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// GET /api/delivery-slots - Get all available delivery slots
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()

    const slots = await prisma.deliverySlot.findMany({
      where: {
        isAvailable: true,
        date: {
          gte: new Date() // Only future dates
        }
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ]
    })

    return NextResponse.json(slots)
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