import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

// Force dynamic rendering since this route uses authentication and headers
export const dynamic = 'force-dynamic'

// GET /api/orders - Get orders (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")

    const where: any = {}

    // If not admin, only show user's own orders
    if (user.role !== "ADMIN") {
      where.userId = user.userId
    } else if (userId) {
      where.userId = userId
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true,
            variation: true
          }
        },
        delivery: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id]/status - Update order status (Admin only)
export async function PUT(request: NextRequest) {
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
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true,
            variation: true
          }
        },
        delivery: true
      }
    })

    // Send notification to customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: "Order Status Updated",
        message: `Your order #${order.id} status has been updated to ${status}`,
        type: "ORDER",
        orderId: order.id
      }
    })

    // Send email notification to customer
    try {
      await sendOrderStatusUpdateEmail(
        order.id,
        order.user.email,
        order.user.name || 'Valued Customer',
        status,
        order.delivery ? {
          date: order.delivery.scheduledDate.toLocaleDateString(),
          time: order.delivery.scheduledTime,
          address: `${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state}`
        } : undefined
      )
    } catch (emailError) {
      console.error("Error sending status update email:", emailError)
      // Don't fail the status update if email fails
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    )
  }
}
