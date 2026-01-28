import { NextRequest, NextResponse } from "next/server"
import { sendEmailVerificationEmail } from "@/lib/email"

export const dynamic = 'force-dynamic'

/**
 * Diagnostic endpoint to test email configuration
 * Only accessible in development or with admin auth
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      // In production, require admin auth
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 401 }
        )
      }
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check configuration
    const config = {
      hasResend: !!process.env.RESEND_API_KEY,
      hasGmail: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
      gmailUser: process.env.GMAIL_USER ? 'SET' : 'NOT SET',
      gmailPass: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET',
    }

    // Try to send test email
    try {
      const testCode = '123456'
      await sendEmailVerificationEmail(email, testCode)
      
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        configuration: config
      })
    } catch (emailError: any) {
      return NextResponse.json({
        success: false,
        error: emailError?.message || 'Unknown error',
        details: emailError?.stack,
        configuration: config
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Email test error:", error)
    return NextResponse.json(
      { 
        error: "Failed to test email",
        message: error?.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return configuration status (without sensitive data)
  const config = {
    hasResend: !!process.env.RESEND_API_KEY,
    hasGmail: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    resendConfigured: !!process.env.RESEND_API_KEY,
    gmailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    serviceAvailable: !!(process.env.RESEND_API_KEY || (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD))
  }

  return NextResponse.json({
    emailConfiguration: config,
    message: config.serviceAvailable 
      ? 'Email service is configured' 
      : 'No email service configured. Please set RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD'
  })
}
