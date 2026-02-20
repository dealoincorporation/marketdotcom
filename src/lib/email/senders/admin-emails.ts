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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Registration - Marketdotcom</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 24px !important; }
            .content { padding: 30px 20px !important; }
            .info-box { padding: 20px !important; }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);">
          <div class="header" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Marketdotcom</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">New User Registration</p>
          </div>

          <div class="content" style="background: white; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h2 style="color: #f97316; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New User Registered</h2>
            <div class="info-box" style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #92400e;">Name:</strong> ${data.name}</p>
              <p style="margin: 10px 0; color: #1f2937; word-break: break-word;"><strong style="color: #92400e;">Email:</strong> ${data.email}</p>
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #92400e;">Phone:</strong> ${data.phone}</p>
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #92400e;">Registration Date:</strong> ${data.registrationDate}</p>
              ${data.referralCode ? `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #f97316;">
                  <p style="margin: 0; color: #ea580c; font-weight: 600;"><strong>🎁 Referral Signup!</strong></p>
                  <p style="margin: 5px 0 0 0; color: #1f2937;"><strong>Referral Code Used:</strong> ${data.referralCode}</p>
                  ${data.referrerName ? `<p style="margin: 5px 0 0 0; color: #1f2937;"><strong>Referred By:</strong> ${data.referrerName}</p>` : ''}
                </div>
              ` : ''}
            </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Notification - Marketdotcom</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 24px !important; }
            .content { padding: 30px 20px !important; }
            .info-box { padding: 20px !important; }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);">
          <div class="header" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Marketdotcom</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Payment Notification</p>
          </div>

          <div class="content" style="background: white; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h2 style="color: #f97316; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Payment Received</h2>
            <div class="info-box" style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #92400e;">Order ID:</strong> ${data.orderId}</p>
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #92400e;">Customer:</strong> ${data.customerName}</p>
              <p style="margin: 10px 0; color: #1f2937; word-break: break-word;"><strong style="color: #92400e;">Email:</strong> ${data.customerEmail}</p>
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #92400e;">Amount:</strong> <span style="color: #f97316; font-weight: 700;">₦${data.amount.toLocaleString()}</span></p>
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #92400e;">Payment Method:</strong> ${data.paymentMethod}</p>
              ${data.transactionId ? `<p style="margin: 10px 0; color: #1f2937; word-break: break-all;"><strong style="color: #92400e;">Transaction ID:</strong> ${data.transactionId}</p>` : ''}
            </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wallet Deposit - Marketdotcom</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; margin: 10px auto !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 24px !important; }
            .header p { font-size: 14px !important; }
            .content { padding: 30px 20px !important; }
            .info-box { padding: 20px !important; }
            .info-box p { font-size: 14px !important; word-break: break-word; }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);">
          <div class="header" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Marketdotcom</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Wallet Deposit</p>
          </div>

          <div class="content" style="background: white; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h2 style="color: #8b5cf6; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Wallet Deposit Notification</h2>
            <div class="info-box" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: 2px solid #8b5cf6; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #6d28d9;">User:</strong> ${data.userName}</p>
              <p style="margin: 10px 0; color: #1f2937; word-break: break-word;"><strong style="color: #6d28d9;">Email:</strong> ${data.userEmail}</p>
              <p style="margin: 10px 0; color: #1f2937;"><strong style="color: #6d28d9;">Amount:</strong> <span style="color: #8b5cf6; font-weight: 700;">₦${data.amount.toLocaleString()}</span></p>
              ${data.transactionId ? `<p style="margin: 10px 0; color: #1f2937; word-break: break-all;"><strong style="color: #6d28d9;">Transaction ID:</strong> ${data.transactionId}</p>` : ''}
            </div>
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
    PENDING: '#fb923c',
    CONFIRMED: '#f97316',
    PROCESSING: '#ea580c',
    SHIPPED: '#f97316',
    DELIVERED: '#ea580c',
    CANCELLED: '#dc2626'
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update - Marketdotcom</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .header { padding: 30px 20px !important; }
            .header h1 { font-size: 24px !important; }
            .content { padding: 30px 20px !important; }
            .info-grid { grid-template-columns: 1fr !important; }
            .status-icon { width: 70px !important; height: 70px !important; }
            .status-icon span { font-size: 28px !important; }
            .button { padding: 14px 24px !important; font-size: 14px !important; display: block !important; width: 100% !important; }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);">
          <div class="header" style="background: linear-gradient(135deg, ${color}, #ea580c); color: white; padding: 40px 30px; text-align: center; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
            <div style="display: inline-block; margin-bottom: 20px;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/mrktdotcom-logo.png" alt="Marketdotcom Logo" style="width: 80px; height: 80px; border-radius: 12px; background: rgba(255,255,255,0.2); padding: 10px; max-width: 100%;">
            </div>
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Marketdotcom</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">📊 Order Status Update</p>
          </div>

          <div class="content" style="background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div class="status-icon" style="width: 80px; height: 80px; background: linear-gradient(135deg, ${color}, #ea580c); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                <span style="color: white; font-size: 32px;">📦</span>
              </div>
              <h2 style="color: ${color}; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">Order #${data.orderId}</h2>
              <p style="color: #92400e; margin: 0; font-size: 18px; font-weight: 500;">Status: <span style="color: ${color}; font-weight: 700;">${label}</span></p>
            </div>

            <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid ${color}; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1);">
              <h3 style="margin: 0 0 20px 0; color: #ea580c; font-size: 20px; font-weight: 600;">👤 Customer Information</h3>
              <div class="info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Customer Name</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${data.customerName}</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Email</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; word-break: break-word;">${data.customerEmail}</p>
                </div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid ${color}; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1);">
              <h3 style="margin: 0 0 20px 0; color: #ea580c; font-size: 20px; font-weight: 600;">📋 Order Details</h3>
              <div class="info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Order ID</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; word-break: break-all;">${data.orderId}</p>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">Current Status</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: ${color};">${label}</p>
                </div>
                ${data.previousStatus ? `
                  <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color};">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">Previous Status</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: #1f2937;">${statusLabels[data.previousStatus.toUpperCase()] || data.previousStatus}</p>
                  </div>
                ` : ''}
              </div>
              ${data.deliveryInfo ? `
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${color}; margin-top: 15px;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>📦 Delivery Information</strong></p>
                  <p style="margin: 5px 0 0 0; color: #1f2937;"><strong>Date:</strong> ${data.deliveryInfo.date}</p>
                  <p style="margin: 5px 0 0 0; color: #1f2937;"><strong>Time:</strong> ${data.deliveryInfo.time}</p>
                  <p style="margin: 5px 0 0 0; color: #1f2937; word-break: break-word;"><strong>Address:</strong> ${data.deliveryInfo.address}</p>
                </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button" style="background: linear-gradient(135deg, ${color}, #ea580c); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                ⚙️ Manage Orders
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #fff7ed, #ffffff); border-radius: 12px; padding: 25px; margin-top: 40px; border: 1px solid #ffedd5; text-align: center;">
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                This is an automated notification from <span style="color: #f97316; font-weight: 600;">Marketdotcom</span>
              </p>
              <p style="color: #ea580c; font-size: 12px; margin: 5px 0 0 0;">
                © ${new Date().getFullYear()} Marketdotcom Admin Panel
              </p>
            </div>
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
