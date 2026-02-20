import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
        DATABASE_URL: process.env.DATABASE_URL ? 'SET (masked)' : 'MISSING',
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
        GMAIL_USER: process.env.GMAIL_USER ? 'SET' : 'MISSING',
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'MISSING',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'SET' : 'MISSING',
      },
      netlify: {
        CONTEXT: process.env.CONTEXT,
        DEPLOY_ID: process.env.DEPLOY_ID,
        SITE_NAME: process.env.SITE_NAME,
      }
    }

    // Test database connection if DATABASE_URL is set
    let dbStatus = 'NOT_TESTED'
    let dbError = null
    if (process.env.DATABASE_URL) {
      try {
        // Use getPrismaClient for proper serverless support
        const { getPrismaClient } = await import('@/lib/prisma')
        const prisma = await getPrismaClient()
        await prisma.$connect()

        // Try a simple query to test the connection
        const userCount = await prisma.user.count()
        dbStatus = `CONNECTED (${userCount} users in database)`

        // Test if we can query
        await prisma.$disconnect()
      } catch (error: any) {
        dbStatus = `ERROR: ${error.message}`
        dbError = {
          message: error.message,
          code: error.code,
          meta: error.meta,
        }
      }
    }

    // Test authentication configuration
    let authStatus = 'NOT_TESTED'
    try {
      const { verifyToken } = await import('@/lib/auth')
      authStatus = 'CONFIG_LOADED'
    } catch (error: any) {
      authStatus = `ERROR: ${error.message}`
    }

    // Test session retrieval
    let sessionStatus = 'NOT_TESTED'
    try {
      const { getUserFromRequest } = await import('@/lib/auth')
      const user = getUserFromRequest(request)
      sessionStatus = user ? 'USER_FOUND' : 'NO_USER'
    } catch (error: any) {
      sessionStatus = `ERROR: ${error.message}`
    }

    return NextResponse.json({
      ...envCheck,
      database: dbStatus,
      auth: authStatus,
      ...(dbError && { database_error_details: dbError }),
      status: 'OK'
    })
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      status: 'ERROR'
    }, { status: 500 })
  }
}