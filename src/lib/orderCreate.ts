import type { PrismaClient } from "@prisma/client"
import { calculatePointsFromAmount } from "@/lib/points"
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email"

/** Round to 2 decimal places to prevent floating-point drift */
function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export type OrderPayload = {
  items: Array<{
    productId: string
    variationId?: string | null
    name?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    unit?: string
  }>
  deliveryAddress: {
    address: string
    city: string
    state: string
    postalCode?: string | null
    phone: string
  }
  deliveryDate: string
  deliveryTime: string
  deliveryNotes?: string | null
  paymentMethod?: string
  useWallet?: boolean
  subtotal: number
  deliveryFee: number
  walletDeduction?: number
  finalTotal: number
  slotAtCapacity?: boolean
}

export type CreateOrderOptions = {
  transactionId?: string | null
  skipEmails?: boolean
  /** When true, order is created as CONFIRMED with paymentStatus COMPLETED (e.g. after Paystack success) */
  setConfirmed?: boolean
}

/**
 * Creates an order (and items, delivery, notifications, points, optional emails).
 * Used by POST /api/orders/create and by payment verify when creating from PendingCheckout.
 */
export async function createOrderFromPayload(
  prisma: PrismaClient,
  userId: string,
  body: OrderPayload,
  options: CreateOrderOptions = {}
): Promise<{ orderId: string }> {
  const {
    items,
    deliveryAddress,
    deliveryDate,
    deliveryTime,
    deliveryNotes,
    paymentMethod,
    useWallet,
    subtotal,
    deliveryFee,
    walletDeduction = 0,
    finalTotal,
    slotAtCapacity = false
  } = body

  const { transactionId = null, skipEmails = false, setConfirmed = false } = options
  const totalAmount = roundCurrency(subtotal + deliveryFee)

  const order = await prisma.order.create({
    data: {
      userId,
      status: setConfirmed ? "CONFIRMED" : "PENDING",
      totalAmount,
      deliveryFee,
      taxAmount: 0,
      discountAmount: roundCurrency(walletDeduction),
      finalAmount: roundCurrency(finalTotal),
      paymentMethod: paymentMethod ?? "paystack",
      paymentStatus: setConfirmed ? "COMPLETED" : "PENDING",
      transactionId
    }
  })

  await prisma.orderItem.createMany({
    data: items.map((item: any) => ({
      orderId: order.id,
      productId: item.productId,
      variationId: item.variationId ?? null,
      name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : null,
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      unitPrice: roundCurrency(Number(item.unitPrice) || 0),
      totalPrice: roundCurrency(Number(item.totalPrice) || 0)
    }))
  })

  const trackingNumber = `DEL${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  await prisma.delivery.create({
    data: {
      orderId: order.id,
      userId,
      address: deliveryAddress.address,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      postalCode: deliveryAddress.postalCode ?? null,
      phone: deliveryAddress.phone,
      scheduledDate: new Date(deliveryDate),
      scheduledTime: deliveryTime,
      deliveryNotes: deliveryNotes ?? null,
      trackingNumber,
      status: "SCHEDULED"
    }
  })

  if (useWallet && walletDeduction > 0) {
    // Verify wallet balance is sufficient before deducting
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true }
    })
    if (!currentUser || currentUser.walletBalance < walletDeduction) {
      throw new Error('Insufficient wallet balance')
    }

    const walletRef = `WO-${order.id}-${Date.now()}`
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: walletDeduction } }
    })
    await prisma.walletTransaction.create({
      data: {
        userId,
        type: "DEBIT",
        amount: walletDeduction,
        method: "wallet",
        description: `Payment for order #${order.id}`,
        status: "COMPLETED",
        reference: walletRef,
        orderId: order.id
      }
    })
    await prisma.reward.create({
      data: {
        userId,
        points: 0,
        description: `Wallet used for order #${order.id}`,
        type: "PURCHASE"
      }
    })
  }

  const pointsSettings = await prisma.pointsSettings.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  })
  const pointsEarned = calculatePointsFromAmount(totalAmount, pointsSettings ? {
    amountThreshold: pointsSettings.amountThreshold,
    pointsPerThreshold: pointsSettings.pointsPerThreshold,
    isActive: pointsSettings.isActive
  } : null)
  if (pointsEarned > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: pointsEarned } }
    })
    await prisma.reward.create({
      data: {
        userId,
        points: pointsEarned,
        description: `Points earned from order #${order.id}`,
        type: "PURCHASE",
        orderId: order.id
      }
    })
  }

  await prisma.notification.create({
    data: {
      userId,
      title: "Order Placed Successfully",
      message: `Your order #${order.id} has been placed and will be delivered on ${new Date(deliveryDate).toLocaleDateString()} between ${deliveryTime}`,
      type: "ORDER",
      orderId: order.id
    }
  })

  if (slotAtCapacity) {
    await prisma.notification.create({
      data: {
        userId,
        title: "Delivery moved to next day",
        message: `The number of deliveries for your chosen day was exceeded. Your order has been received and will be delivered the next available day. We'll notify you when it's scheduled.`,
        type: "ORDER",
        orderId: order.id
      }
    })
  }

  if (!skipEmails) {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })
    if (userData) {
      try {
        const emailData = {
          orderId: order.id,
          customerName: userData.name || "Valued Customer",
          customerEmail: userData.email || "",
          items: items.map((item: any) => ({
            name: item.name ?? "Product",
            quantity: item.quantity,
            price: item.unitPrice,
            unit: item.unit ?? "item"
          })),
          total: finalTotal,
          deliveryAddress: `${deliveryAddress.address}, ${deliveryAddress.city}, ${deliveryAddress.state}`,
          deliveryDate: new Date(deliveryDate).toLocaleDateString(),
          deliveryTime,
          slotAtCapacity
        }
        await sendOrderConfirmationEmail(emailData)
        await sendAdminOrderNotification(emailData)
      } catch (e) {
        console.error("Error sending order emails:", e)
      }
    }
  }

  return { orderId: order.id }
}
