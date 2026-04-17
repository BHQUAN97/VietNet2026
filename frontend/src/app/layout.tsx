import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { GlassNav } from '@/components/layout/GlassNav'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { FloatingWidgets } from '@/components/layout/FloatingWidgets'
import { PublicShell } from '@/components/layout/PublicShell'

export const metadata: Metadata = {
  title: {
    default: 'VietNet Interior',
    template: '%s | VietNet Interior',
  },
  description:
    'Nội thất cao cấp cho không gian sống tinh tế. Thiết kế - Thi công - Nội thất trọn gói.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'VietNet Interior',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Doc nonce tu middleware de forward xuong page (JSON-LD inline script can nonce nay).
  // Neu middleware khong chay (vi du static export), fallback ve undefined — Next.js
  // se tu inject nonce vao _next script tag qua build-time, inline script user-land
  // se bi block (acceptable fallback).
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="vi">
      <head>
        {/* Google Sans Flex — variable font for all text */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&subset=latin,vietnamese&display=swap" rel="stylesheet" />
        {/* Preconnect to R2 CDN for faster image loading */}
        <link rel="preconnect" href="https://pub-vietnet.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-vietnet.r2.dev" />
        {/* Preconnect to API (SSR internal) */}
        <link rel="preconnect" href={process.env.INTERNAL_API_URL || 'http://localhost:4000'} />
      </head>
      <body className="min-h-screen antialiased" data-nonce={nonce}>
        <GlassNav />
        <PublicShell>
          {children}
        </PublicShell>
        <Footer />
        <BottomNav />
        <FloatingWidgets />
      </body>
    </html>
  )
}
