import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { sendOrderStatusUpdateEmail, sendAdminOrderStatusUpdateNotification } from "@/lib/email"

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

    // Valid order statuses (mapping UI statuses to database statuses)
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'ON_DELIVERY', 'DELIVERED', 'CANCELLED']
    const statusMapping: Record<string, string> = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'processing': 'PROCESSING',
      'shipped': 'ON_DELIVERY', // Map 'shipped' to 'ON_DELIVERY'
      'on_delivery': 'ON_DELIVERY',
      'delivered': 'DELIVERED',
      'cancelled': 'CANCELLED',
    }

    // Normalize status (convert lowercase to uppercase, handle 'shipped' -> 'ON_DELIVERY')
    const normalizedStatus = statusMapping[status.toLowerCase()] || status.toUpperCase()

    // Validate status
    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Get current order status before updating
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const previousStatus = currentOrder.status

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: normalizedStatus },
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

    // Map status back to lowercase for UI/email (ON_DELIVERY -> shipped)
    const displayStatus = normalizedStatus === 'ON_DELIVERY' ? 'shipped' : normalizedStatus.toLowerCase()

    // Send notification to customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: "Order Status Updated",
        message: `Your order #${order.id} status has been updated to ${displayStatus}`,
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
        displayStatus,
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

    // Send admin notification about status change
    try {
      await sendAdminOrderStatusUpdateNotification({
        orderId: order.id,
        customerName: order.user.name || 'Valued Customer',
        customerEmail: order.user.email,
        status: displayStatus,
        previousStatus: previousStatus === 'ON_DELIVERY' ? 'shipped' : previousStatus.toLowerCase(),
        deliveryInfo: order.delivery ? {
          date: order.delivery.scheduledDate.toLocaleDateString(),
          time: order.delivery.scheduledTime,
          address: `${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state}`
        } : undefined
      })
    } catch (adminEmailError) {
      console.error("Error sending admin status update notification:", adminEmailError)
      // Don't fail the status update if admin email fails
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
