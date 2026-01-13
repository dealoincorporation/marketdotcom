import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import * as ejs from 'ejs'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Resend (if API key available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Initialize Nodemailer transporter (Gmail fallback)
const nodemailerTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // App-specific password, not regular password
  }
})

// Email templates directory
const templatesDir = path.join(process.cwd(), 'src', 'templates', 'email')

// Helper function to render EJS templates
async function renderTemplate(templateName: string, data: any): Promise<string> {
  try {
    const templatePath = path.join(templatesDir, `${templateName}.ejs`)
    const template = fs.readFileSync(templatePath, 'utf8')
    return ejs.render(template, data)
  } catch (error) {
    console.error(`Error rendering template ${templateName}:`, error)
    throw error
  }
}

export interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
    unit: string
  }>
  total: number
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const itemsHtml = data.items.map(item => {
      const itemName = item.name || 'Product'
      const itemUnit = item.unit || 'item'
      return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${itemName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} ${itemUnit}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `}).join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - Marketdotcom</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
            <div style="display: inline-block; margin-bottom: 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom Logo" style="width: 80px; height: 80px; border-radius: 12px; background: rgba(255,255,255,0.2); padding: 10px;">
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Marketdotcom</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px; font-weight: 300;">Order Confirmation</p>
          </div>

          <div style="background: white; border-radius: 0 0 15px 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">
                <span style="color: white; font-size: 32px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #f97316; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Thank you for your order!</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">Your order has been successfully placed and confirmed</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 30px;">Hi ${data.customerName},</p>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.1);">
              <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 20px; font-weight: 600;">📋 Order Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Order ID</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace;">${data.orderId}</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Delivery Date</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${data.deliveryDate}</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Delivery Time</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${data.deliveryTime}</p>
                </div>
              </div>
            </div>

            <h3 style="color: #1f2937; margin: 30px 0 20px 0; font-size: 22px; font-weight: 600;">🛒 Items Ordered</h3>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <table style="width: 100%; border-collapse: collapse;">
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
                  <tr style="background: #fef3c7; border-top: 2px solid #f59e0b;">
                    <td colspan="3" style="padding: 20px; text-align: right; font-weight: 700; font-size: 16px; color: #92400e;">Grand Total:</td>
                    <td style="padding: 20px; text-align: right; font-weight: 700; font-size: 18px; color: #f97316;">₦${data.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border: 1px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 30px 0; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: rgba(59, 130, 246, 0.1); border-radius: 50%;"></div>
              <h4 style="margin: 0 0 15px 0; color: #1d4ed8; font-size: 20px; font-weight: 600;">🚚 Delivery Information</h4>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>📍 Delivery Address:</strong><br>${data.deliveryAddress}</p>
              </div>
              <div style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">⏰ Your order will be delivered within 4 hours of your selected delivery time. You'll receive a tracking update once your order is on the way.</p>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); transition: all 0.3s ease;">
                📦 Track Your Order
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; padding: 25px; margin-top: 40px; border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="color: #475569; font-size: 14px; margin: 0;">
                  Need help with your order? Contact our support team
                </p>
                <a href="mailto:support@marketdotcom.com" style="color: #f97316; font-weight: 600; text-decoration: none; font-size: 16px;">📧 support@marketdotcom.com</a>
                <br>
                <a href="https://wa.me/2349941023" style="color: #25d366; font-weight: 600; text-decoration: none; font-size: 16px;">📱 WhatsApp Support: +234 994 1023</a>
              </div>

              <div style="border-top: 1px solid #cbd5e1; padding-top: 20px; text-align: center;">
                <div style="display: inline-block; margin-bottom: 15px;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom" style="width: 40px; height: 40px; border-radius: 8px; background: rgba(249, 115, 22, 0.1); padding: 5px;">
                </div>
                <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0; font-weight: 500;">
                  Thank you for choosing <span style="color: #f97316; font-weight: 600;">Marketdotcom</span>!
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">
                  Fresh products, delivered with care • © ${new Date().getFullYear()} Marketdotcom
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Try Resend first (if API key is available)
    if (resend && process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending order confirmation email via Resend...')

        const result = await resend.emails.send({
          from: 'Marketdotcom <onboarding@resend.dev>',
          to: data.customerEmail,
          subject: `Order Confirmation - ${data.orderId}`,
          html: emailHtml,
        })

        console.log('✅ Order confirmation email sent successfully via Resend')
        return result
      } catch (resendError) {
        console.warn('⚠️  Resend failed, falling back to Nodemailer:', resendError instanceof Error ? resendError.message : String(resendError))
      }
    }

    // Fallback to Nodemailer with Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending order confirmation email via Gmail...')

        const mailOptions = {
          from: `"Marketdotcom" <${process.env.GMAIL_USER}>`,
          to: data.customerEmail,
          subject: `Order Confirmation - ${data.orderId}`,
          html: emailHtml,
        }

        const result = await nodemailerTransporter.sendMail(mailOptions)
        console.log('✅ Order confirmation email sent successfully via Gmail')
        return result
      } catch (nodemailerError) {
        console.error('❌ Nodemailer failed:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
        throw nodemailerError
      }
    }

    // If neither service is configured, throw an error
    throw new Error('No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD')
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}

export async function sendAdminOrderNotification(data: OrderEmailData) {
  try {
    const itemsHtml = data.items.map(item => {
      const itemName = item.name || 'Product'
      const itemUnit = item.unit || 'item'
      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${itemName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity} ${itemUnit}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `}).join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Order Received - Marketdotcom</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 20px rgba(220, 38, 38, 0.2);">
            <div style="display: inline-block; margin-bottom: 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom Logo" style="width: 80px; height: 80px; border-radius: 12px; background: rgba(255,255,255,0.2); padding: 10px;">
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Marketdotcom</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px; font-weight: 300;">🔔 New Order Alert</p>
          </div>

          <div style="background: white; border-radius: 0 0 15px 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
                <span style="color: white; font-size: 32px; font-weight: bold;">🛒</span>
              </div>
              <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">New Order Alert!</h2>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">A new order has been placed and requires your attention</p>
            </div>

            <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fca5a5; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #991b1b; font-size: 18px; font-weight: 600;">👤 Customer Information</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">Customer</p>
                  <p style="margin: 3px 0 0 0; font-weight: 600; color: #1f2937;">${data.customerName}</p>
                </div>
                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">Email</p>
                  <p style="margin: 3px 0 0 0; font-weight: 600; color: #1f2937; font-size: 14px;">${data.customerEmail}</p>
                </div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; font-weight: 600;">📋 Order Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">Order ID</p>
                  <p style="margin: 3px 0 0 0; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace;">${data.orderId}</p>
                </div>
                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">Delivery Date</p>
                  <p style="margin: 3px 0 0 0; font-weight: 600; color: #1f2937;">${data.deliveryDate}</p>
                </div>
                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">Delivery Time</p>
                  <p style="margin: 3px 0 0 0; font-weight: 600; color: #1f2937;">${data.deliveryTime}</p>
                </div>
              </div>
            </div>

            <h3 style="color: #1f2937; margin: 30px 0 20px 0; font-size: 20px; font-weight: 600;">📦 Items Ordered</h3>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white;">
                    <th style="padding: 14px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                    <th style="padding: 14px; text-align: center; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Quantity</th>
                    <th style="padding: 14px; text-align: right; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
                    <th style="padding: 14px; text-align: right; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #fef2f2; border-top: 2px solid #dc2626;">
                    <td colspan="3" style="padding: 16px; text-align: right; font-weight: 700; font-size: 15px; color: #991b1b;">Grand Total:</td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; font-size: 16px; color: #dc2626;">₦${data.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border: 1px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h4 style="margin: 0 0 15px 0; color: #1d4ed8; font-size: 18px; font-weight: 600;">🚚 Delivery Information</h4>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>📍 Delivery Address:</strong><br>${data.deliveryAddress}</p>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
                ⚙️ Manage Orders
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fca5a5; border-radius: 12px; padding: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500;">
                ⚡ Please ensure timely processing and delivery of this order to maintain customer satisfaction.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send to admin email
    const adminEmail = 'marketdotcominfo@gmail.com'

    // Try Resend first (if API key is available)
    if (resend && process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending admin order notification via Resend...')

    const result = await resend.emails.send({
      from: 'Marketdotcom <onboarding@resend.dev>',
      to: adminEmail,
      subject: `New Order Received - ${data.orderId}`,
      html: emailHtml,
    })

        console.log('✅ Admin order notification sent successfully via Resend')
        return result
      } catch (resendError) {
        console.warn('⚠️  Resend failed, falling back to Nodemailer:', resendError instanceof Error ? resendError.message : String(resendError))
      }
    }

    // Fallback to Nodemailer with Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending admin order notification via Gmail...')

        const mailOptions = {
          from: `"Marketdotcom" <${process.env.GMAIL_USER}>`,
          to: adminEmail,
          subject: `New Order Received - ${data.orderId}`,
          html: emailHtml,
        }

        const result = await nodemailerTransporter.sendMail(mailOptions)
        console.log('✅ Admin order notification sent successfully via Gmail')
        return result
      } catch (nodemailerError) {
        console.error('❌ Nodemailer failed:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
        throw nodemailerError
      }
    }

    // If neither service is configured, throw an error
    throw new Error('No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD')
  } catch (error) {
    console.error('Error sending admin order notification:', error)
    throw error
  }
}

export async function sendEmailVerificationEmail(email: string, verificationCode: string) {
  try {
    // Prepare template data
    const templateData = {
      verificationCode,
      email,
      appName: 'Marketdotcom',
      currentYear: new Date().getFullYear()
    }

    // Try Gmail first (more reliable for sending to any email)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending email via Gmail...')

        // Render EJS template
        const emailHtml = await renderTemplate('email-verification', templateData)

        const mailOptions = {
          from: `"Marketdotcom" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: '🔐 Your Verification Code - Marketdotcom',
          html: emailHtml,
        }

        const result = await nodemailerTransporter.sendMail(mailOptions)
        console.log('✅ Email sent successfully via Gmail')
        return result
      } catch (nodemailerError) {
        console.error('❌ Gmail failed, falling back to Resend:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
      }
    }

    // Fallback to Resend (if API key is available)
    if (resend && process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending email via Resend...')

        // Render EJS template
        const emailHtml = await renderTemplate('email-verification', templateData)

        const result = await resend.emails.send({
          from: 'Marketdotcom <onboarding@resend.dev>',
          to: email,
          subject: '🔐 Your Verification Code - Marketdotcom',
          html: emailHtml,
        })

        console.log('✅ Email sent successfully via Resend')
        return result
      } catch (resendError) {
        console.warn('⚠️  Resend failed:', resendError instanceof Error ? resendError.message : String(resendError))
        throw resendError
      }
    }

    // If neither service is configured, throw an error
    throw new Error('No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD')

  } catch (error) {
    console.error('❌ Error sending email verification:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    // Prepare template data
    const templateData = {
      resetUrl,
      email,
      appName: 'Marketdotcom'
    }

    // Try Resend first (if API key is available)
    if (resend && process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending password reset email via Resend...')

        // Render EJS template
        const emailHtml = await renderTemplate('password-reset', templateData)

        const result = await resend.emails.send({
          from: 'Marketdotcom <onboarding@resend.dev>',
          to: email,
          subject: 'Reset Your Password - Marketdotcom',
          html: emailHtml,
        })

        console.log('✅ Password reset email sent successfully via Resend')
        return result
      } catch (resendError) {
        console.warn('⚠️  Resend failed, falling back to Nodemailer:', resendError instanceof Error ? resendError.message : String(resendError))
      }
    }

    // Fallback to Nodemailer with Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending password reset email via Gmail...')

        // Render EJS template
        const emailHtml = await renderTemplate('password-reset', templateData)

        const mailOptions = {
          from: `"Marketdotcom" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: 'Reset Your Password - Marketdotcom',
          html: emailHtml,
        }

        const result = await nodemailerTransporter.sendMail(mailOptions)
        console.log('✅ Password reset email sent successfully via Gmail')
        return result
      } catch (nodemailerError) {
        console.error('❌ Nodemailer failed:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
        throw nodemailerError
      }
    }

    // If neither service is configured, throw an error
    throw new Error('No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD')

  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw error
  }
}

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
    const statusMessages = {
      confirmed: {
        title: "Order Confirmed",
        message: "Your order has been confirmed and is being prepared.",
        color: "#22c55e"
      },
      processing: {
        title: "Order Processing",
        message: "Your order is currently being processed and packaged.",
        color: "#3b82f6"
      },
      shipped: {
        title: "Order Shipped",
        message: "Your order has been shipped and is on its way to you.",
        color: "#8b5cf6"
      },
      delivered: {
        title: "Order Delivered",
        message: "Your order has been successfully delivered. Enjoy your fresh products!",
        color: "#10b981"
      }
    }

    const statusInfo = statusMessages[status as keyof typeof statusMessages] || {
      title: "Order Update",
      message: `Your order status has been updated to: ${status}`,
      color: "#6b7280"
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${statusInfo.title} - Marketdotcom</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Marketdotcom</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Status Update</p>
          </div>

          <div style="background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: ${statusInfo.color}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: ${statusInfo.color}; margin: 0;">${statusInfo.title}</h2>
            </div>

            <p>Hi ${customerName},</p>
            <p>${statusInfo.message}</p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
              ${deliveryInfo ? `
                <p><strong>Delivery Date:</strong> ${deliveryInfo.date}</p>
                <p><strong>Delivery Time:</strong> ${deliveryInfo.time}</p>
                <p><strong>Delivery Address:</strong> ${deliveryInfo.address}</p>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Order</a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                Thank you for choosing Marketdotcom!
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Try Resend first (if API key is available)
    if (resend && process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending order status update via Resend...')

    const result = await resend.emails.send({
      from: 'Marketdotcom <onboarding@resend.dev>',
      to: customerEmail,
      subject: `${statusInfo.title} - Order ${orderId}`,
      html: emailHtml,
    })

        console.log('✅ Order status update sent successfully via Resend')
        return result
      } catch (resendError) {
        console.warn('⚠️  Resend failed, falling back to Nodemailer:', resendError instanceof Error ? resendError.message : String(resendError))
      }
    }

    // Fallback to Nodemailer with Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending order status update via Gmail...')

        const mailOptions = {
          from: `"Marketdotcom" <${process.env.GMAIL_USER}>`,
          to: customerEmail,
          subject: `${statusInfo.title} - Order ${orderId}`,
          html: emailHtml,
        }

        const result = await nodemailerTransporter.sendMail(mailOptions)
        console.log('✅ Order status update sent successfully via Gmail')
        return result
      } catch (nodemailerError) {
        console.error('❌ Nodemailer failed:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
        throw nodemailerError
      }
    }

    // If neither service is configured, throw an error
    throw new Error('No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD')
  } catch (error) {
    console.error('Error sending order status update email:', error)
    throw error
  }
}

// Admin user registration notification
export async function sendAdminUserRegistrationNotification(data: {
  userId: string
  name: string
  email: string
  phone: string
  registrationDate: string
}) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New User Registration</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .highlight { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New User Registration</h1>
            <p>A new user has joined Marketdotcom!</p>
          </div>
          <div class="content">
            <div class="highlight">
              <h3>User Details:</h3>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
              <p><strong>User ID:</strong> ${data.userId}</p>
              <p><strong>Registration Date:</strong> ${new Date(data.registrationDate).toLocaleString()}</p>
            </div>
            <p>Please welcome this new member to our community!</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Marketdotcom Admin System.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const adminEmail = 'marketdotcominfo@gmail.com'

  try {
    // Try Resend first
    if (resend && process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending admin user registration notification via Resend...')

        const result = await resend.emails.send({
          from: 'Marketdotcom Admin <onboarding@resend.dev>',
          to: adminEmail,
          subject: `New User Registration - ${data.name}`,
          html: emailHtml,
        })

        console.log('✅ Admin notification sent successfully via Resend')
        return result
      } catch (resendError) {
        console.warn('⚠️  Resend failed, falling back to Nodemailer:', resendError instanceof Error ? resendError.message : String(resendError))
      }
    }

    // Fallback to Nodemailer with Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending admin user registration notification via Gmail...')

        const mailOptions = {
          from: `"Marketdotcom Admin" <${process.env.GMAIL_USER}>`,
          to: adminEmail,
          subject: `New User Registration - ${data.name}`,
          html: emailHtml,
        }

        const result = await nodemailerTransporter.sendMail(mailOptions)
        console.log('✅ Admin notification sent successfully via Gmail')
        return result
      } catch (nodemailerError) {
        console.error('❌ Nodemailer failed:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
        throw nodemailerError
      }
    }

    throw new Error('No email service configured for admin notifications')
  } catch (error) {
    console.error('Error sending admin user registration notification:', error)
    throw error
  }
}

// Admin payment notification
export async function sendAdminPaymentNotification(data: {
  orderId: string
  userId: string
  customerName: string
  customerEmail: string
  amount: number
  paymentMethod: string
  transactionId: string
  paymentDate: string
  status: string
}) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .highlight { background: #eff6ff; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #3b82f6; }
          .status { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-success { background: #dcfce7; color: #166534; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payment Received!</h1>
            <p>Payment confirmed for Order #${data.orderId}</p>
          </div>
          <div class="content">
            <div class="highlight">
              <h3>Payment Details:</h3>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Payment Date:</strong> ${new Date(data.paymentDate).toLocaleString()}</p>
              <p><strong>Status:</strong> <span class="status status-success">${data.status}</span></p>
            </div>

            <p>The payment has been successfully processed. Please prepare the order for delivery.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Marketdotcom Admin System.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const adminEmail = 'marketdotcominfo@gmail.com'

  try {
    // Try Resend first
    if (resend && process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending admin payment notification via Resend...')

        const result = await resend.emails.send({
          from: 'Marketdotcom Admin <onboarding@resend.dev>',
          to: adminEmail,
          subject: `Payment Received - Order ${data.orderId}`,
          html: emailHtml,
        })

        console.log('✅ Admin payment notification sent successfully via Resend')
        return result
      } catch (resendError) {
        console.warn('⚠️  Resend failed, falling back to Nodemailer:', resendError instanceof Error ? resendError.message : String(resendError))
      }
    }

    // Fallback to Nodemailer with Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending admin payment notification via Gmail...')

        const mailOptions = {
          from: `"Marketdotcom Admin" <${process.env.GMAIL_USER}>`,
          to: adminEmail,
          subject: `Payment Received - Order ${data.orderId}`,
          html: emailHtml,
        }

        const result = await nodemailerTransporter.sendMail(mailOptions)
        console.log('✅ Admin payment notification sent successfully via Gmail')
        return result
      } catch (nodemailerError) {
        console.error('❌ Nodemailer failed:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
        throw nodemailerError
      }
    }

    throw new Error('No email service configured for admin notifications')
  } catch (error) {
    console.error('Error sending admin payment notification:', error)
    throw error
  }
}
