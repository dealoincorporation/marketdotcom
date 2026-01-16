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

    // First, get orders without product relations to avoid null errors
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            variation: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true
              }
            }
          },
        },
        delivery: true
      },
      orderBy: { createdAt: "desc" }
    })

    // Now fetch product data separately to handle missing products gracefully
    const productIds = orders.flatMap(order =>
      order.items.map(item => item.productId).filter(Boolean)
    )

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        basePrice: true,
        unit: true,
        categoryId: true
      }
    })

    // Create a product lookup map
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product
      return acc
    }, {} as Record<string, any>)

    // Combine orders with product data
    const ordersWithProducts = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: productMap[item.productId] || null // Will be null for missing products
      }))
    }))

    return NextResponse.json(ordersWithProducts)
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
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                basePrice: true,
                unit: true,
                categoryId: true
              }
            },
            variation: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true
              }
            }
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
