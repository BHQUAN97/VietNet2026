import type { Metadata } from 'next'
import { Noto_Serif, Manrope } from 'next/font/google'
import './globals.css'
import { GlassNav } from '@/components/layout/GlassNav'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { FloatingWidgets } from '@/components/layout/FloatingWidgets'

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
    'Noi that cao cap cho khong gian song tinh te. Thiet ke - Thi cong - Noi that tron goi.',
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
        {/* Preconnect to API */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'} />
      </head>
      <body className="min-h-screen antialiased">
        <GlassNav />
        <main className="pt-[var(--nav-height)] pb-[var(--bottom-nav-height)] md:pb-0">
          {children}
        </main>
        <Footer />
        <BottomNav />
        <FloatingWidgets />
      </body>
    </html>
  )
}
