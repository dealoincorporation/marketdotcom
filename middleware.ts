import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow access to public routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/help") ||
    pathname === "/api/simple-test" ||
    pathname === "/api/test-env"
  ) {
    return NextResponse.next()
  }

  // Check for authentication on protected routes
  const authHeader = req.headers.get('authorization')
  let token = null

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else {
    // For client-side requests, check cookies or other methods
    // This is a simplified version - you might need more sophisticated token extraction
  }

  // Verify JWT token
  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      // User is authenticated, allow access
      return NextResponse.next()
    }
  }

  // For API routes, return 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // For pages, redirect to login
  return NextResponse.redirect(new URL("/auth/login", req.url))
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/:path*",
  ],
}
