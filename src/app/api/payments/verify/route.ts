import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPrismaClient } from "@/lib/prisma"
import { PaystackService } from "@/lib/paystack"
import { sendAdminPaymentNotification, sendAdminOrderNotification, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email"

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

    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      )
    }

    // Verify the payment with Paystack
    const paystackResponse = await PaystackService.verifyTransaction(reference)

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      )
    }

    const transactionData = paystackResponse.data
    console.log('Payment verification - Paystack response:', {
      reference,
      status: transactionData.status,
      amount: transactionData.amount
    })

    // Find the order by transactionId first
    let order = await prisma.order.findFirst({
      where: {
        transactionId: reference,
        userId: user.userId
      }
    })

    // If not found by transactionId, try to find by metadata orderId (fallback)
    if (!order && transactionData.metadata?.orderId) {
      console.log('Order not found by transactionId, trying metadata orderId:', transactionData.metadata.orderId)
      order = await prisma.order.findFirst({
        where: {
          id: transactionData.metadata.orderId,
          userId: user.userId
        }
      })
    }

    // If still not found, try to find any pending order for this user (last resort)
    if (!order) {
      console.log('Order not found by transactionId or metadata, searching for pending orders...')
      order = await prisma.order.findFirst({
        where: {
          userId: user.userId,
          paymentStatus: 'PENDING',
          paymentMethod: 'paystack'
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    if (!order) {
      console.error('Order not found for payment verification:', { reference, userId: user.userId })
      return NextResponse.json(
        { error: "Order not found. Please contact support with reference: " + reference },
        { status: 404 }
      )
    }

    console.log('Order found for verification:', { orderId: order.id, currentStatus: order.status })

    // RECONCILIATION: Verify amount matches
    const expectedAmount = order.finalAmount * 100 // Convert to kobo
    const actualAmount = transactionData.amount
    if (transactionData.status === 'success' && Math.abs(expectedAmount - actualAmount) > 1) {
      console.error('Amount mismatch detected:', {
        orderId: order.id,
        expected: expectedAmount,
        actual: actualAmount,
        difference: Math.abs(expectedAmount - actualAmount)
      })
      // Log but don't fail - amounts might differ due to rounding or fees
    }

    // IDEMPOTENCY CHECK: Don't update if already completed
    if (order.paymentStatus === "COMPLETED" && transactionData.status === 'success') {
      console.log('Order already completed, skipping duplicate update:', order.id)
      // Still return success to acknowledge verification
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        orderId: order.id,
        status: "COMPLETED"
      })
    }

    // Update order based on payment status
    const paymentStatus = transactionData.status === 'success' ? 'COMPLETED' : 'FAILED'
    const orderStatus = transactionData.status === 'success' ? 'CONFIRMED' : 'CANCELLED'

    // Only update if status is different (idempotency)
    if (order.paymentStatus !== paymentStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: paymentStatus,
          status: orderStatus
        }
      })
    }

    // Create or update payment record (idempotent upsert)
    await prisma.payment.upsert({
      where: { transactionId: reference },
      update: {
        status: paymentStatus,
        gatewayResponse: transactionData,
        amount: transactionData.amount / 100 // Update amount in case it changed
      },
      create: {
        orderId: order.id,
        userId: user.userId,
        amount: transactionData.amount / 100, // Convert from kobo
        currency: "NGN",
        method: "PAYSTACK",
        status: paymentStatus,
        transactionId: reference,
        gatewayResponse: transactionData
      }
    })

    // Send notifications and emails if payment was successful
    if (paymentStatus === 'COMPLETED') {
      try {
        // Get full order data with items and delivery info
        const fullOrder = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    unit: true
                  }
                }
              }
            },
            delivery: true,
            user: {
              select: {
                name: true,
                email: true,
                referredById: true
              }
            }
          }
        })

        if (fullOrder && fullOrder.user) {
          const userData = fullOrder.user
          const deliveryInfo = fullOrder.delivery

          // Send order confirmation email to customer
          try {
            await sendOrderConfirmationEmail({
              orderId: fullOrder.id,
              customerName: userData.name || 'Valued Customer',
              customerEmail: userData.email || '',
              items: fullOrder.items.map(item => ({
                name: item.product?.name || 'Product',
                quantity: item.quantity,
                price: item.unitPrice,
                unit: item.product?.unit || 'item'
              })),
              total: fullOrder.finalAmount,
              deliveryAddress: deliveryInfo 
                ? `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state}`
                : 'Address not available',
              deliveryDate: deliveryInfo?.scheduledDate 
                ? new Date(deliveryInfo.scheduledDate).toLocaleDateString()
                : 'Date not available',
              deliveryTime: deliveryInfo?.scheduledTime || 'Time not available'
            })
          } catch (emailError) {
            console.error("Failed to send order confirmation email:", emailError)
          }

          // Send order status update email (CONFIRMED)
          try {
            await sendOrderStatusUpdateEmail(
              fullOrder.id,
              userData.email || '',
              userData.name || 'Valued Customer',
              'confirmed',
              deliveryInfo ? {
                date: new Date(deliveryInfo.scheduledDate).toLocaleDateString(),
                time: deliveryInfo.scheduledTime,
                address: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state}`
              } : undefined
            )
          } catch (statusEmailError) {
            console.error("Failed to send order status update email:", statusEmailError)
          }

          // Send admin payment notification
          try {
            await sendAdminPaymentNotification({
              orderId: fullOrder.id,
              customerName: userData.name || 'Valued Customer',
              customerEmail: userData.email || 'No email provided',
              amount: transactionData.amount / 100,
              paymentMethod: 'Paystack',
              transactionId: reference
            })
          } catch (adminEmailError) {
            console.error("Failed to send admin payment notification:", adminEmailError)
          }

          // Send admin order notification (since we skipped it during order creation)
          try {
            await sendAdminOrderNotification({
              orderId: fullOrder.id,
              customerName: userData.name || 'Valued Customer',
              customerEmail: userData.email || '',
              items: fullOrder.items.map(item => ({
                name: item.product?.name || 'Product',
                quantity: item.quantity,
                price: item.unitPrice,
                unit: item.product?.unit || 'item'
              })),
              total: fullOrder.finalAmount,
              deliveryAddress: deliveryInfo 
                ? `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state}`
                : 'Address not available',
              deliveryDate: deliveryInfo?.scheduledDate 
                ? new Date(deliveryInfo.scheduledDate).toLocaleDateString()
                : 'Date not available',
              deliveryTime: deliveryInfo?.scheduledTime || 'Time not available'
            })
          } catch (adminOrderError) {
            console.error("Failed to send admin order notification:", adminOrderError)
          }

          // Create notification for user (title includes payer name so admin sees who paid when viewing all notifications)
          const customerName = userData.name?.trim() || userData.email || "A customer"
          const amountStr = (transactionData.amount / 100).toLocaleString()
          await prisma.notification.create({
            data: {
              userId: user.userId,
              title: `Payment from ${customerName} – Order Confirmed`,
              message: `Your payment of ₦${amountStr} has been confirmed. Order #${fullOrder.id} is now being processed and will be delivered soon!`,
              type: "ORDER",
              orderId: fullOrder.id
            }
          })

          // Referrer points when a referred customer completes a purchase
          const referredById = (fullOrder.user as { referredById?: string | null })?.referredById
          if (referredById) {
            const referralSettings = await prisma.referralSettings.findFirst({
              orderBy: { createdAt: 'desc' }
            })
            const pointsPerPurchase = referralSettings?.referrerPointsPerPurchase ?? 0
            if (pointsPerPurchase > 0) {
              await prisma.reward.create({
                data: {
                  userId: referredById,
                  points: pointsPerPurchase,
                  description: `Referred customer purchase – Order #${fullOrder.id}`,
                  type: "REFERRAL_PURCHASE",
                  orderId: fullOrder.id
                }
              })
              await prisma.notification.create({
                data: {
                  userId: referredById,
                  title: "Referral purchase points",
                  message: `You earned ${pointsPerPurchase} points because someone you referred completed a purchase (Order #${fullOrder.id}). Convert points to cash in Wallet.`,
                  type: "REFERRAL"
                }
              })
            }
          }
        }
      } catch (notificationError) {
        console.error("Failed to send notifications:", notificationError)
        // Don't fail the payment verification if notifications fail
      }
    }

    return NextResponse.json({
      success: true,
      paymentStatus: paymentStatus,
      orderStatus: orderStatus,
      orderId: order.id, // Return orderId for frontend redirect
      transactionData: {
        reference: transactionData.reference,
        amount: transactionData.amount / 100,
        status: transactionData.status,
        paid_at: transactionData.paid_at
      }
    })

  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    )
  }
}