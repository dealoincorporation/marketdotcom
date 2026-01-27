import * as ejs from 'ejs'
import * as fs from 'fs'
import * as path from 'path'
import { sendEmail } from '../client'

const templatesDir = path.join(process.cwd(), 'src', 'templates', 'email')

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

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(email: string, verificationCode: string) {
  try {
    const templateData = {
      verificationCode,
      email,
      appName: 'Marketdotcom',
      currentYear: new Date().getFullYear()
    }

    const emailHtml = await renderTemplate('email-verification', templateData)

    return await sendEmail({
      to: email,
      subject: '🔐 Your Verification Code - Marketdotcom',
      html: emailHtml,
    })
  } catch (error) {
    console.error('❌ Error sending email verification:', error)
    throw error
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset - Marketdotcom</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Marketdotcom</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
          </div>

          <div style="background: white; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
            <h2 style="color: #f97316;">Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
          </div>
        </body>
      </html>
    `

    return await sendEmail({
      to: email,
      subject: '🔐 Reset Your Password - Marketdotcom',
      html: emailHtml,
    })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}
