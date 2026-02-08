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
    // URL encode the token to ensure it's properly handled in email links
    const encodedToken = encodeURIComponent(resetToken)
    // Hardcode production domain for email templates
    const baseUrl = 'https://marketdotcom.ng'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodedToken}`

    const templateData = {
      resetUrl,
      resetToken: encodedToken,
      email,
      appName: 'Marketdotcom',
      currentYear: new Date().getFullYear()
    }

    const emailHtml = await renderTemplate('password-reset', templateData)

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
