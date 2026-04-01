import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side redirect for unauthenticated admin access.
 * Checks for auth_session cookie (set by auth context on login).
 * This is a fast hint check — actual token validation happens client-side.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip login page — always accessible
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for auth session cookie
  const hasSession = request.cookies.get('auth_session')

  if (!hasSession) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
