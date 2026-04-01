'use client'

import { usePathname } from 'next/navigation'

/**
 * Wrapper cho main content — thêm padding cho nav/bottom-nav trên public pages,
 * bỏ padding trên admin pages (admin có layout riêng).
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <main className={isAdmin ? '' : 'pt-[var(--nav-height)] pb-[var(--bottom-nav-height)] md:pb-0'}>
      {children}
    </main>
  )
}
