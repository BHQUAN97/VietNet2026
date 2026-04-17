import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * Middleware thuc hien 2 nhiem vu:
 * 1) Sinh nonce ngau nhien moi request va gan Content-Security-Policy header
 *    (nonce-based CSP + strict-dynamic) — thay the cho CSP tinh o nginx.
 *    Nonce duoc truyen vao page qua request header `x-nonce` de server components
 *    co the doc qua `headers()` va gan vao bat ky inline <script> nao (vi du JSON-LD).
 * 2) Verify chu ky JWT trong cookie `auth_session` cho route /admin/*
 *    — defense-in-depth, BE van re-validate JWT tren moi API call.
 *
 * Tham khao: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 */
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || ''

function getSecretKey(): Uint8Array | null {
  if (!JWT_SECRET || JWT_SECRET.length < 32) return null
  return new TextEncoder().encode(JWT_SECRET)
}

/**
 * Build CSP header string voi nonce hien tai.
 * Note: 'strict-dynamic' cho phep script co nonce tu load them script khac
 * — Next.js chunk loader dua vao co che nay.
 *
 * 'unsafe-eval' van giu vi Next.js 14 App Router van su dung eval cho mot so
 * dynamic import / RSC payload parsing. Neu sau nay Next.js loai bo thi co the go.
 */
function buildCsp(nonce: string): string {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com https://bhquan.site https://bhquan.store`,
    `font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com`,
    `connect-src 'self' wss: ws: https://*.r2.dev`,
    `media-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com`,
    `frame-src 'none'`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ]
  return directives.join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Sinh nonce + dat CSP header ──────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // Gan nonce vao request header de layout/page server component co the doc qua headers()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  // ── 2. Admin auth check ─────────────────────────────────────
  // Chi ap dung voi /admin/* (tru /admin/login). Cac route khac chi set CSP.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth_session')?.value
    const loginUrl = new URL('/admin/login', request.url)

    if (!token) {
      return NextResponse.redirect(loginUrl)
    }

    const secret = getSecretKey()
    if (secret) {
      try {
        await jwtVerify(token, secret, { algorithms: ['HS256'] })
      } catch {
        const res = NextResponse.redirect(loginUrl)
        res.cookies.delete('auth_session')
        return res
      }
    }
    // Neu secret chua config -> fallback sang presence check (giu behavior cu)
  }

  // ── 3. Response + CSP header ────────────────────────────────
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

/**
 * Matcher: ap dung cho tat ca route tru API internal + static assets + prefetch.
 * - Loai tru /api, /_next/static, /_next/image, favicon, robots, sitemap
 * - Loai tru prefetch requests (khong can CSP moi cho prefetch, giam overhead)
 */
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
