import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Test 1: Basic environment check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    }

    // Test 2: Check authentication
    let nextAuthStatus = 'NOT_TESTED'
    try {
      const { getUserFromRequest } = await import('@/lib/auth')
      const user = getUserFromRequest(request)
      nextAuthStatus = 'IMPORTED_SUCCESS'
    } catch (error: any) {
      nextAuthStatus = `IMPORT_FAILED: ${error.message}`
    }

    // Test 3: Try to import auth options
    let authOptionsStatus = 'NOT_TESTED'
    try {
      const { verifyToken } = await import('@/lib/auth')
      authOptionsStatus = 'LOADED_SUCCESS'
    } catch (error: any) {
      authOptionsStatus = `LOAD_FAILED: ${error.message}`
    }

    // Test 4: Try to initialize Prisma client
    let prismaStatus = 'NOT_TESTED'
    try {
      const { getPrismaClient } = await import('@/lib/prisma')
      const prisma = await getPrismaClient()
      prismaStatus = 'INITIALIZED_SUCCESS'
    } catch (error: any) {
      prismaStatus = `INIT_FAILED: ${error.message}`
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      nextauth: nextAuthStatus,
      authOptions: authOptionsStatus,
      prisma: prismaStatus,
      status: 'TEST_COMPLETED'
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5), // First 5 lines of stack
      status: 'TEST_FAILED'
    }, { status: 500 })
  }
}