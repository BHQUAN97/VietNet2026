import type { Metadata } from 'next'
import { Noto_Serif, Manrope } from 'next/font/google'
import './globals.css'
import { GlassNav } from '@/components/layout/GlassNav'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { FloatingWidgets } from '@/components/layout/FloatingWidgets'
import { PublicShell } from '@/components/layout/PublicShell'

const notoSerif = Noto_Serif({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${notoSerif.variable} ${manrope.variable}`}>
      <head>
        {/* Preconnect to R2 CDN for faster image loading */}
        <link rel="preconnect" href="https://pub-vietnet.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-vietnet.r2.dev" />
        {/* Preconnect to API (SSR internal) */}
        <link rel="preconnect" href={process.env.INTERNAL_API_URL || 'http://localhost:4000'} />
      </head>
      <body className="min-h-screen antialiased">
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
