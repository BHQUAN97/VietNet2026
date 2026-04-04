'use client'

import { usePathname } from 'next/navigation'
import { usePageTracking } from '@/hooks/usePageTracking'

/**
 * Wrapper cho main content — thêm padding cho nav/bottom-nav trên public pages,
 * bỏ padding trên admin pages (admin có layout riêng).
 * Tự động track page views cho analytics.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  // Ghi nhận page view mỗi khi user chuyển trang
  usePageTracking()

  return (
    <main className={isAdmin ? '' : 'pt-[var(--nav-height)] pb-[var(--bottom-nav-height)] md:pb-0'}>
      {children}
    </main>
  )
}
