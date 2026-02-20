import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'EXISTS' : 'NOT FOUND',
    DATABASE_URL: process.env.DATABASE_URL ? 'EXISTS' : 'NOT FOUND',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'EXISTS' : 'NOT FOUND',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'EXISTS' : 'NOT FOUND',
    NODE_ENV: process.env.NODE_ENV,
    allEnv: Object.keys(process.env).filter(key =>
      key.includes('RESEND') ||
      key.includes('DATABASE') ||
      key.includes('NEXT') ||
      key.includes('AUTH')
    )
  })
}