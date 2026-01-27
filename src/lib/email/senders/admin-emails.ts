import { sendEmail } from '../client'
import type { AdminUserRegistrationData, AdminPaymentNotificationData, AdminWalletDepositData } from '../types'

/**
 * Send admin user registration notification
 */
export async function sendAdminUserRegistrationNotification(data: {
  userId: string
  name: string
  email: string
  phone: string
  registrationDate: string
  referralCode?: string
  referrerName?: string
}) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New User Registration - Marketdotcom</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Marketdotcom</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New User Registration</p>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
          <h2 style="color: #3b82f6;">New User Registered</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Registration Date:</strong> ${data.registrationDate}</p>
            ${data.referralCode ? `
              <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #0369a1;"><strong>🎁 Referral Signup!</strong></p>
                <p style="margin: 5px 0 0 0;"><strong>Referral Code Used:</strong> ${data.referralCode}</p>
                ${data.referrerName ? `<p style="margin: 5px 0 0 0;"><strong>Referred By:</strong> ${data.referrerName}</p>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
    </html>
  `

  const adminEmail = 'marketdotcominfo@gmail.com'
  const subject = data.referralCode 
    ? `🎁 New Referral Signup - ${data.name}` 
    : `New User Registration - ${data.name}`
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html: emailHtml,
  })
}

/**
 * Send admin payment notification
 */
export async function sendAdminPaymentNotification(data: AdminPaymentNotificationData) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Notification - Marketdotcom</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Marketdotcom</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Payment Notification</p>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
          <h2 style="color: #10b981;">Payment Received</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `

  const adminEmail = 'marketdotcominfo@gmail.com'
  return await sendEmail({
    to: adminEmail,
    subject: `Payment Received - Order ${data.orderId}`,
    html: emailHtml,
  })
}

/**
 * Send admin wallet deposit notification
 */
export async function sendAdminWalletDepositNotification(data: AdminWalletDepositData) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Wallet Deposit - Marketdotcom</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Marketdotcom</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Wallet Deposit</p>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
          <h2 style="color: #8b5cf6;">Wallet Deposit Notification</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>User:</strong> ${data.userName}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
            <p><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</p>
            ${data.transactionId ? `<p><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `

  const adminEmail = 'marketdotcominfo@gmail.com'
  return await sendEmail({
    to: adminEmail,
    subject: `Wallet Deposit - ${data.userName}`,
    html: emailHtml,
  })
}

/**
 * Send admin order status update notification
 */
export async function sendAdminOrderStatusUpdateNotification(data: {
  orderId: string
  customerName: string
  customerEmail: string
  status: string
  previousStatus?: string
  deliveryInfo?: {
    date: string
    time: string
    address: string
  }
}) {
  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    CONFIRMED: '#22c55e',
    PROCESSING: '#3b82f6',
    SHIPPED: '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444'
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  }

  const color = statusColors[data.status.toUpperCase()] || '#6b7280'
  const label = statusLabels[data.status.toUpperCase()] || data.status

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update - Marketdotcom</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, ${color}, ${color}dd); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="display: inline-block; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom Logo" style="width: 80px; height: 80px; border-radius: 12px; background: rgba(255,255,255,0.2); padding: 10px;">
          </div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Marketdotcom</h1>
          <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">📊 Order Status Update</p>
        </div>

        <div style="background: white; border-radius: 0 0 15px 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${color}, ${color}dd); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              <span style="color: white; font-size: 32px;">📦</span>
            </div>
            <h2 style="color: ${color}; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Order #${data.orderId}</h2>
            <p style="color: #6b7280; margin: 0; font-size: 18px; font-weight: 500;">Status: <span style="color: ${color}; font-weight: 700;">${label}</span></p>
          </div>

          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid ${color}; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h3 style="margin: 0 0 20px 0; color: #92400e; font-size: 20px; font-weight: 600;">👤 Customer Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Customer Name</p>
                <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${data.customerName}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Email</p>
                <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; word-break: break-word;">${data.customerEmail}</p>
              </div>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border: 1px solid ${color}; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h3 style="margin: 0 0 20px 0; color: #1d4ed8; font-size: 20px; font-weight: 600;">📋 Order Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Order ID</p>
                <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace;">${data.orderId}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Current Status</p>
                <p style="margin: 5px 0 0 0; font-weight: 600; color: ${color};">${label}</p>
              </div>
              ${data.previousStatus ? `
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Previous Status</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${statusLabels[data.previousStatus.toUpperCase()] || data.previousStatus}</p>
                </div>
              ` : ''}
            </div>
            ${data.deliveryInfo ? `
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color}; margin-top: 15px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>📦 Delivery Information</strong></p>
                <p style="margin: 5px 0 0 0; color: #1f2937;"><strong>Date:</strong> ${data.deliveryInfo.date}</p>
                <p style="margin: 5px 0 0 0; color: #1f2937;"><strong>Time:</strong> ${data.deliveryInfo.time}</p>
                <p style="margin: 5px 0 0 0; color: #1f2937;"><strong>Address:</strong> ${data.deliveryInfo.address}</p>
              </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, ${color}, ${color}dd); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              ⚙️ Manage Orders
            </a>
          </div>

          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; padding: 25px; margin-top: 40px; border: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 500;">
              This is an automated notification from <span style="color: #f97316; font-weight: 600;">Marketdotcom</span>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">
              © ${new Date().getFullYear()} Marketdotcom Admin Panel
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const adminEmail = 'marketdotcominfo@gmail.com'
  return await sendEmail({
    to: adminEmail,
    subject: `Order Status Update - Order #${data.orderId} is now ${label}`,
    html: emailHtml,
  })
}
