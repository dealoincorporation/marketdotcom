import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"

// DELETE /api/orders/[id] - Delete an order (Admin only)
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

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        delivery: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Delete in correct order to maintain referential integrity
    // 1. Delete order items
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    })

    // 2. Delete delivery if exists
    if (order.delivery) {
      await prisma.delivery.delete({
        where: { orderId: id }
      })
    }

    // 3. Delete wallet transaction if exists
    await prisma.walletTransaction.deleteMany({
      where: { orderId: id }
    })

    // 4. Delete associated rewards
    await prisma.reward.deleteMany({
      where: { orderId: id }
    })

    // 5. Delete associated notifications
    await prisma.notification.deleteMany({
      where: { orderId: id }
    })

    // 6. Delete the order
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
}