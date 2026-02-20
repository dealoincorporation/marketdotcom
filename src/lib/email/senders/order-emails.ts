import { sendEmail } from '../client'
import type { OrderEmailData, OrderStatusUpdateData } from '../types'

/**
 * Generate order confirmation email HTML
 */
function generateOrderConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => {
    const itemName = item.name || 'Product'
    const itemUnit = item.unit || 'item'
    return `
      <tr>
        <td data-label="Item" style="padding: 12px; border-bottom: 1px solid #ffedd5;">${itemName}</td>
        <td data-label="Quantity" style="padding: 12px; border-bottom: 1px solid #ffedd5; text-align: center;">${item.quantity} ${itemUnit}</td>
        <td data-label="Unit Price" style="padding: 12px; border-bottom: 1px solid #ffedd5; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td data-label="Total" style="padding: 12px; border-bottom: 1px solid #ffedd5; text-align: right; font-weight: 600; color: #f97316;">₦${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Marketdotcom</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 24px !important; }
            .header p { font-size: 16px !important; }
            .content { padding: 30px 20px !important; }
            .order-details-grid { grid-template-columns: 1fr !important; }
            .order-table { display: block !important; }
            .order-table thead { display: none !important; }
            .order-table tbody, .order-table tr, .order-table td { display: block !important; }
            .order-table tr { margin-bottom: 15px !important; border: 1px solid #f97316 !important; border-radius: 8px !important; padding: 15px !important; }
            .order-table td { text-align: left !important; padding: 8px 0 !important; border: none !important; }
            .order-table td:before { content: attr(data-label) ": "; font-weight: 600; color: #f97316; }
            .delivery-info { padding: 20px !important; }
            .button { padding: 14px 24px !important; font-size: 14px !important; display: block !important; width: 100% !important; }
            .footer-content { padding: 20px !important; }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);">
          <div class="header" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 40px 30px; text-align: center; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
            <div style="display: inline-block; margin-bottom: 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom Logo" style="width: 80px; height: 80px; border-radius: 12px; background: rgba(255,255,255,0.2); padding: 10px; max-width: 100%;">
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Marketdotcom</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px; font-weight: 300;">Order Confirmation</p>
          </div>

          <div class="content" style="background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                <span style="color: white; font-size: 32px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #f97316; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Thank you for your order!</h2>
              <p style="color: #92400e; margin: 0; font-size: 16px;">Your order has been successfully placed and confirmed</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 30px;">Hi ${data.customerName},</p>

            <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1);">
              <h3 style="margin: 0 0 15px 0; color: #ea580c; font-size: 20px; font-weight: 600;">📋 Order Details</h3>
              <div class="order-details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Order ID</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; word-break: break-all;">${data.orderId}</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Delivery Date</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${data.deliveryDate}</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Delivery Time</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${data.deliveryTime}</p>
                </div>
              </div>
            </div>

            ${data.slotAtCapacity ? `
            <div style="background: #fef3c7; border: 2px solid #d97706; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #92400e;">⚠️ Delivery moved to next day</p>
              <p style="margin: 0; font-size: 14px; color: #78350f;">The number of deliveries we could make for your chosen day was exceeded. Your order has been received and <strong>your products will be delivered the next available day</strong>. We will notify you when your delivery is scheduled.</p>
            </div>
            ` : ''}

            <h3 style="color: #ea580c; margin: 30px 0 20px 0; font-size: 22px; font-weight: 600;">🛒 Items Ordered</h3>
            <div style="background: white; border: 2px solid #ffedd5; border-radius: 12px; overflow: hidden; margin: 20px 0; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);">
              <table class="order-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #f97316, #ea580c); color: white;">
                    <th style="padding: 16px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                    <th style="padding: 16px; text-align: center; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Quantity</th>
                    <th style="padding: 16px; text-align: right; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
                    <th style="padding: 16px; text-align: right; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border-top: 2px solid #f97316;">
                    <td colspan="3" style="padding: 20px; text-align: right; font-weight: 700; font-size: 16px; color: #ea580c;">Grand Total:</td>
                    <td style="padding: 20px; text-align: right; font-weight: 700; font-size: 18px; color: #f97316;">₦${data.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="delivery-info" style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin: 30px 0; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: rgba(249, 115, 22, 0.1); border-radius: 50%;"></div>
              <h4 style="margin: 0 0 15px 0; color: #ea580c; font-size: 20px; font-weight: 600;">🚚 Delivery Information</h4>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                <p style="margin: 0; font-size: 14px; color: #374151; word-break: break-word;"><strong>📍 Delivery Address:</strong><br>${data.deliveryAddress}</p>
              </div>
              <div style="background: rgba(249, 115, 22, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 0; color: #ea580c; font-size: 14px;">⏰ Your order will be delivered within 4 hours of your selected delivery time. You'll receive a tracking update once your order is on the way.</p>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                📦 Track Your Order
              </a>
            </div>

            <div class="footer-content" style="background: linear-gradient(135deg, #fff7ed, #ffffff); border-radius: 12px; padding: 25px; margin-top: 40px; border: 1px solid #ffedd5;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  Need help with your order? Contact our support team
                </p>
                <a href="mailto:marketdotcominfo@gmail.com" style="color: #f97316; font-weight: 600; text-decoration: none; font-size: 16px;">📧 marketdotcominfo@gmail.com</a>
                <br>
                <a href="https://wa.me/2348138353576" style="color: #f97316; font-weight: 600; text-decoration: none; font-size: 16px;">📱 WhatsApp/Call: +234 813 835 3576</a>
              </div>

              <div style="border-top: 1px solid #ffedd5; padding-top: 20px; text-align: center;">
                <div style="display: inline-block; margin-bottom: 15px;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom" style="width: 40px; height: 40px; border-radius: 8px; background: rgba(249, 115, 22, 0.1); padding: 5px; max-width: 100%;">
                </div>
                <p style="color: #92400e; font-size: 14px; margin: 10px 0 0 0; font-weight: 500;">
                  Thank you for choosing <span style="color: #f97316; font-weight: 600;">Marketdotcom</span>!
                </p>
                <p style="color: #ea580c; font-size: 12px; margin: 5px 0 0 0;">
                  Fresh products, delivered with care • © ${new Date().getFullYear()} Marketdotcom
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Generate admin order notification HTML
 */
function generateAdminOrderNotificationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => {
    const itemName = item.name || 'Product'
    const itemUnit = item.unit || 'item'
    return `
      <tr>
        <td data-label="Item" style="padding: 12px; border-bottom: 1px solid #ffedd5;">${itemName}</td>
        <td data-label="Quantity" style="padding: 12px; border-bottom: 1px solid #ffedd5; text-align: center;">${item.quantity} ${itemUnit}</td>
        <td data-label="Unit Price" style="padding: 12px; border-bottom: 1px solid #ffedd5; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td data-label="Total" style="padding: 12px; border-bottom: 1px solid #ffedd5; text-align: right; font-weight: 600; color: #f97316;">₦${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Received - Marketdotcom</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 24px !important; }
            .header p { font-size: 16px !important; }
            .content { padding: 30px 20px !important; }
            .order-table { display: block !important; }
            .order-table thead { display: none !important; }
            .order-table tbody, .order-table tr, .order-table td { display: block !important; }
            .order-table tr { margin-bottom: 15px !important; border: 1px solid #f97316 !important; border-radius: 8px !important; padding: 15px !important; }
            .order-table td { text-align: left !important; padding: 8px 0 !important; border: none !important; }
            .order-table td:before { content: attr(data-label) ": "; font-weight: 600; color: #f97316; }
            .button { padding: 14px 24px !important; font-size: 14px !important; display: block !important; width: 100% !important; }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);">
          <div class="header" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 40px 30px; text-align: center; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Marketdotcom</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">🔔 New Order Alert</p>
          </div>

          <div class="content" style="background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h2 style="color: #f97316; margin: 0 0 10px 0; font-size: 28px;">New Order Alert!</h2>
            <p style="color: #92400e; margin: 0 0 30px 0;">Order ID: ${data.orderId}</p>
            
            <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #ea580c; font-size: 18px;">👤 Customer Information</h3>
              <p style="margin: 8px 0; color: #1f2937;"><strong style="color: #92400e;">Customer:</strong> ${data.customerName}</p>
              <p style="margin: 8px 0; color: #1f2937; word-break: break-word;"><strong style="color: #92400e;">Email:</strong> ${data.customerEmail}</p>
            </div>

            <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #ea580c; font-size: 18px;">📋 Order Details</h3>
              <p style="margin: 8px 0; color: #1f2937;"><strong style="color: #92400e;">Delivery Date:</strong> ${data.deliveryDate}</p>
              <p style="margin: 8px 0; color: #1f2937;"><strong style="color: #92400e;">Delivery Time:</strong> ${data.deliveryTime}</p>
              <p style="margin: 8px 0; color: #1f2937;"><strong style="color: #92400e;">Total:</strong> <span style="color: #f97316; font-weight: 700;">₦${data.total.toLocaleString()}</span></p>
            </div>

            <h3 style="color: #ea580c; margin: 30px 0 20px 0;">📦 Items Ordered</h3>
            <div style="background: white; border: 2px solid #ffedd5; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);">
              <table class="order-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #f97316, #ea580c); color: white;">
                    <th style="padding: 14px; text-align: left;">Item</th>
                    <th style="padding: 14px; text-align: center;">Quantity</th>
                    <th style="padding: 14px; text-align: right;">Unit Price</th>
                    <th style="padding: 14px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border-top: 2px solid #f97316;">
                    <td colspan="3" style="padding: 16px; text-align: right; font-weight: 700; color: #ea580c;">Grand Total:</td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; color: #f97316;">₦${data.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h4 style="margin: 0 0 15px 0; color: #ea580c;">🚚 Delivery Address</h4>
              <p style="margin: 0; color: #1f2937; word-break: break-word;">${data.deliveryAddress}</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                ⚙️ Manage Orders
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const emailHtml = generateOrderConfirmationHtml(data)
    return await sendEmail({
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderId}`,
      html: emailHtml,
    })
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}

/**
 * Send admin order notification
 */
export async function sendAdminOrderNotification(data: OrderEmailData) {
  try {
    const emailHtml = generateAdminOrderNotificationHtml(data)
    const adminEmail = 'marketdotcominfo@gmail.com'
    return await sendEmail({
      to: adminEmail,
      subject: `New Order Received - ${data.orderId}`,
      html: emailHtml,
    })
  } catch (error) {
    console.error('Error sending admin order notification:', error)
    throw error
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdateEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  status: string,
  deliveryInfo?: {
    date: string
    time: string
    address: string
  }
) {
  try {
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      confirmed: {
        title: "Order Confirmed",
        message: "Your order has been confirmed and is being prepared.",
        color: "#f97316"
      },
      processing: {
        title: "Order Processing",
        message: "Your order is currently being processed and packaged.",
        color: "#fb923c"
      },
      shipped: {
        title: "🚚 Your Order is On the Way!",
        message: "Great news! Your order has been shipped and is currently on its way to you. You can track your delivery status in your dashboard.",
        color: "#ea580c"
      },
      delivered: {
        title: "Order Delivered",
        message: "Your order has been successfully delivered. Enjoy your fresh products!",
        color: "#f97316"
      }
    }

    const statusInfo = statusMessages[status] || {
      title: "Order Update",
      message: `Your order status has been updated to: ${status}`,
      color: "#f97316"
    }

    // Get status icon emoji
    const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
        case 'confirmed': return '✅'
        case 'processing': return '📦'
        case 'shipped': return '🚚'
        case 'delivered': return '🎉'
        default: return '📋'
      }
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusInfo.title} - Marketdotcom</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 10px !important; }
              .header { padding: 30px 20px !important; }
              .header h1 { font-size: 24px !important; }
              .header p { font-size: 16px !important; }
              .content { padding: 30px 20px !important; }
              .order-info-grid { grid-template-columns: 1fr !important; }
              .status-icon { width: 80px !important; height: 80px !important; }
              .status-icon span { font-size: 36px !important; }
              .button { padding: 14px 24px !important; font-size: 14px !important; display: block !important; width: 100% !important; }
              .footer-content { padding: 20px !important; }
            }
          </style>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
          <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);">
            <div class="header" style="background: linear-gradient(135deg, ${statusInfo.color}, #ea580c); color: white; padding: 40px 30px; text-align: center; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
              <div style="display: inline-block; margin-bottom: 20px;">
                <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom Logo" style="width: 80px; height: 80px; border-radius: 12px; background: rgba(255,255,255,0.2); padding: 10px; max-width: 100%;">
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Marketdotcom</h1>
              <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px; font-weight: 300;">Order Status Update</p>
            </div>

            <div class="content" style="background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div class="status-icon" style="width: 100px; height: 100px; background: linear-gradient(135deg, ${statusInfo.color}, #ea580c); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                  <span style="color: white; font-size: 48px; font-weight: bold;">${getStatusIcon(status)}</span>
                </div>
                <h2 style="color: ${statusInfo.color}; margin: 0 0 10px 0; font-size: 32px; font-weight: 600;">${statusInfo.title}</h2>
                <p style="color: #92400e; margin: 0; font-size: 16px;">${statusInfo.message}</p>
              </div>

              <p style="font-size: 16px; margin-bottom: 30px;">Hi ${customerName},</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">${statusInfo.message}</p>

              <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid ${statusInfo.color}; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1);">
                <h3 style="margin: 0 0 20px 0; color: #ea580c; font-size: 20px; font-weight: 600;">📋 Order Information</h3>
                <div class="order-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusInfo.color};">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">Order ID</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; word-break: break-all;">${orderId}</p>
                  </div>
                  <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusInfo.color};">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">Current Status</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: ${statusInfo.color}; text-transform: capitalize;">${status.charAt(0).toUpperCase() + status.slice(1)}</p>
                  </div>
                </div>
                ${deliveryInfo ? `
                  <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; margin-top: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">Delivery Date</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${deliveryInfo.date}</p>
                  </div>
                  <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; margin-top: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">Delivery Time</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${deliveryInfo.time}</p>
                  </div>
                  <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; margin-top: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">Delivery Address</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; word-break: break-word;">${deliveryInfo.address}</p>
                  </div>
                ` : ''}
              </div>

              ${status === 'shipped' ? `
                <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 15px;">🚚</div>
                  <h3 style="margin: 0 0 10px 0; color: #ea580c; font-size: 22px; font-weight: 600;">Your Order is On the Way!</h3>
                  <p style="margin: 0; color: #92400e; font-size: 16px;">Track your delivery in real-time from your dashboard. We'll notify you when it arrives!</p>
                </div>
              ` : ''}

              ${status === 'delivered' ? `
                <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
                  <h3 style="margin: 0 0 10px 0; color: #ea580c; font-size: 22px; font-weight: 600;">Order Delivered Successfully!</h3>
                  <p style="margin: 0; color: #92400e; font-size: 16px;">We hope you enjoy your fresh products. Thank you for shopping with Marketdotcom!</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                  📦 Track Your Order
                </a>
              </div>

              <div class="footer-content" style="background: linear-gradient(135deg, #fff7ed, #ffffff); border-radius: 12px; padding: 25px; margin-top: 40px; border: 1px solid #ffedd5;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <p style="color: #92400e; font-size: 14px; margin: 0;">
                    Need help with your order? Contact our support team
                  </p>
                  <a href="mailto:marketdotcominfo@gmail.com" style="color: #f97316; font-weight: 600; text-decoration: none; font-size: 16px;">📧 marketdotcominfo@gmail.com</a>
                  <br>
                  <a href="https://wa.me/2348138353576" style="color: #f97316; font-weight: 600; text-decoration: none; font-size: 16px;">📱 WhatsApp/Call: +234 813 835 3576</a>
                </div>

                <div style="border-top: 1px solid #ffedd5; padding-top: 20px; text-align: center;">
                  <div style="display: inline-block; margin-bottom: 15px;">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom" style="width: 40px; height: 40px; border-radius: 8px; background: rgba(249, 115, 22, 0.1); padding: 5px; max-width: 100%;">
                  </div>
                  <p style="color: #92400e; font-size: 14px; margin: 10px 0 0 0; font-weight: 500;">
                    Thank you for choosing <span style="color: #f97316; font-weight: 600;">Marketdotcom</span>!
                  </p>
                  <p style="color: #ea580c; font-size: 12px; margin: 5px 0 0 0;">
                    Fresh products, delivered with care • © ${new Date().getFullYear()} Marketdotcom
                  </p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    return await sendEmail({
      to: customerEmail,
      subject: `${statusInfo.title} - Order ${orderId}`,
      html: emailHtml,
    })
  } catch (error) {
    console.error('Error sending order status update email:', error)
    throw error
  }
}
