import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// Initialize Resend (if API key available)
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Initialize Nodemailer transporter (Gmail fallback)
export const nodemailerTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // App-specific password, not regular password
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Send email using Resend first, fallback to Nodemailer
 */
export async function sendEmail(options: EmailOptions): Promise<any> {
  const from = options.from || 'Marketdotcom <onboarding@resend.dev>'
  
  // Try Resend first (if API key is available)
  if (resend && process.env.RESEND_API_KEY) {
    try {
      console.log('📧 Sending email via Resend...')
      const result = await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      console.log('✅ Email sent successfully via Resend')
      return result
    } catch (resendError) {
      console.warn('⚠️  Resend failed, falling back to Nodemailer:', resendError instanceof Error ? resendError.message : String(resendError))
    }
  }

  // Fallback to Nodemailer with Gmail
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      console.log('📧 Sending email via Gmail...')
      const mailOptions = {
        from: `"Marketdotcom" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }
      const result = await nodemailerTransporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully via Gmail')
      return result
    } catch (nodemailerError) {
      console.error('❌ Nodemailer failed:', nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError))
      throw nodemailerError
    }
  }

  // If neither service is configured, throw an error
  throw new Error('No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD')
}
