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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Marketdotcom</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 10px !important; }
              .header { padding: 30px 20px !important; }
              .header h1 { font-size: 24px !important; }
              .content { padding: 30px 20px !important; }
              .button { padding: 14px 24px !important; font-size: 14px !important; display: block !important; width: 100% !important; }
            }
          </style>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #fff7ed;">
          <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);">
            <div class="header" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Marketdotcom</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Password Reset</p>
            </div>

            <div class="content" style="background: white; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              <h2 style="color: #f97316; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              <p style="color: #374151; margin-bottom: 20px;">You requested to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 600; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">Reset Password</a>
              </div>
              <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; border-radius: 12px; padding: 20px; margin-top: 30px;">
                <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">⚠️ If you didn't request this, please ignore this email.</p>
                <p style="color: #ea580c; font-size: 12px; margin: 0;">This link will expire in 1 hour.</p>
              </div>
            </div>
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
