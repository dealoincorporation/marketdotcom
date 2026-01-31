import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { calculatePointsFromAmount } from "@/lib/points"
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const prisma = await getPrismaClient()
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user data from database for email
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        name: true,
        email: true
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: "User data not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
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
      walletDeduction,
      finalTotal,
      skipEmails = false // Skip emails for Paystack payments until payment is confirmed
    } = body

    // Calculate total amount
    const totalAmount = subtotal + deliveryFee

    // Create order
    console.log('Creating order...', {
      userId: user.userId,
      itemsCount: items.length,
      finalTotal,
      paymentMethod,
      skipEmails
    })
    
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        status: "PENDING",
        totalAmount,
        deliveryFee,
        taxAmount: 0, // Could be calculated based on location
        discountAmount: walletDeduction,
        finalAmount: finalTotal,
        paymentMethod,
        paymentStatus: "PENDING",
        transactionId: null, // Would be set after payment
      }
    })
    
    console.log('Order created successfully:', { orderId: order.id, status: order.status })

    // Create order items
    await prisma.orderItem.createMany({
      data: items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        variationId: item.variationId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    })

    // Generate unique tracking number
    const trackingNumber = `DEL${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create delivery record
    await prisma.delivery.create({
      data: {
        orderId: order.id,
        userId: user.userId,
        address: deliveryAddress.address,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postalCode: deliveryAddress.postalCode || null,
        phone: deliveryAddress.phone,
        scheduledDate: new Date(deliveryDate),
        scheduledTime: deliveryTime,
        deliveryNotes,
        trackingNumber,
        status: "SCHEDULED"
      }
    })

    // Deduct from wallet if used
    if (useWallet && walletDeduction > 0) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          walletBalance: {
            decrement: walletDeduction
          }
        }
      })

      // Create reward record for wallet usage
      await prisma.reward.create({
        data: {
          userId: user.userId,
          points: 0,
          description: `Wallet used for order #${order.id}`,
          type: "PURCHASE"
        }
      })
    }

    // Award points for purchase (threshold-based: e.g. every ₦50,000 = 1 or 10 points)
    const pointsSettings = await prisma.pointsSettings.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    const pointsEarned = calculatePointsFromAmount(totalAmount, pointsSettings ? {
      amountThreshold: pointsSettings.amountThreshold,
      pointsPerThreshold: pointsSettings.pointsPerThreshold,
      isActive: pointsSettings.isActive
    } : null)
    if (pointsEarned > 0) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          points: {
            increment: pointsEarned
          }
        }
      })

      await prisma.reward.create({
        data: {
          userId: user.userId,
          points: pointsEarned,
          description: `Points earned from order #${order.id}`,
          type: "PURCHASE",
          orderId: order.id
        }
      })
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: user.userId,
        title: "Order Placed Successfully",
        message: `Your order #${order.id} has been placed and will be delivered on ${new Date(deliveryDate).toLocaleDateString()} between ${deliveryTime}`,
        type: "ORDER",
        orderId: order.id
      }
    })

    // Send email notifications (skip for Paystack payments until payment is confirmed)
    if (!skipEmails) {
      try {
        const emailData = {
          orderId: order.id,
          customerName: userData.name || 'Valued Customer',
          customerEmail: userData.email || '',
          items: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice,
            unit: item.unit
          })),
          total: finalTotal,
          deliveryAddress: `${deliveryAddress.address}, ${deliveryAddress.city}, ${deliveryAddress.state}`,
          deliveryDate: new Date(deliveryDate).toLocaleDateString(),
          deliveryTime: deliveryTime
        }

        // Send confirmation email to customer
        await sendOrderConfirmationEmail(emailData)

        // Send notification email to admin
        await sendAdminOrderNotification(emailData)

      } catch (emailError) {
        console.error("Error sending email notifications:", emailError)
        // Don't fail the order if email fails
      }
    }

    return NextResponse.json({
      orderId: order.id,
      message: "Order created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
