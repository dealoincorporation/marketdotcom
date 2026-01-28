import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// Initialize Resend (if API key available)
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Initialize Nodemailer transporter (Gmail fallback) - only if credentials are available
let nodemailerTransporter: nodemailer.Transporter | null = null

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  try {
    nodemailerTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // App-specific password, not regular password
      }
    })
    console.log('✅ Nodemailer transporter initialized with Gmail')
  } catch (error) {
    console.error('❌ Failed to initialize Nodemailer:', error)
  }
} else {
  console.log('⚠️  Nodemailer not configured (GMAIL_USER or GMAIL_APP_PASSWORD missing)')
}

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
  
  // Log email attempt
  console.log('📧 Attempting to send email:', {
    to: options.to,
    subject: options.subject,
    hasResend: !!resend,
    hasNodemailer: !!nodemailerTransporter,
    resendKeySet: !!process.env.RESEND_API_KEY,
    gmailUserSet: !!process.env.GMAIL_USER,
    gmailPassSet: !!process.env.GMAIL_APP_PASSWORD
  })
  
  // Try Resend first (if API key is available)
  if (resend && process.env.RESEND_API_KEY) {
    try {
      console.log('📧 Attempting to send email via Resend...')
      const result = await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
      console.log('✅ Email sent successfully via Resend:', {
        id: result.data?.id,
        to: options.to
      })
      return result
    } catch (resendError: any) {
      const errorMessage = resendError instanceof Error ? resendError.message : String(resendError)
      const errorDetails = resendError?.response?.body || resendError?.message || 'Unknown error'
      console.error('❌ Resend failed:', {
        error: errorMessage,
        details: errorDetails,
        to: options.to
      })
      
      // If Resend fails and we have Nodemailer, try fallback
      if (nodemailerTransporter) {
        console.log('⚠️  Falling back to Nodemailer...')
      } else {
        // If no fallback, throw the error
        throw new Error(`Resend failed: ${errorMessage}. No fallback email service configured.`)
      }
    }
  }

  // Fallback to Nodemailer with Gmail
  if (nodemailerTransporter && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      console.log('📧 Attempting to send email via Gmail/Nodemailer...')
      const mailOptions = {
        from: `"Marketdotcom" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }
      const result = await nodemailerTransporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully via Gmail:', {
        messageId: result.messageId,
        to: options.to
      })
      return result
    } catch (nodemailerError: any) {
      const errorMessage = nodemailerError instanceof Error ? nodemailerError.message : String(nodemailerError)
      const errorCode = nodemailerError?.code || 'UNKNOWN'
      console.error('❌ Nodemailer failed:', {
        error: errorMessage,
        code: errorCode,
        to: options.to,
        fullError: nodemailerError
      })
      throw new Error(`Email sending failed: ${errorMessage} (Code: ${errorCode})`)
    }
  }

  // If neither service is configured, throw a clear error
  const errorMsg = 'No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD in your environment variables.'
  console.error('❌', errorMsg)
  throw new Error(errorMsg)
}
