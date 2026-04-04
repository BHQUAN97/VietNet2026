'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Tự động ghi nhận page view khi user chuyển trang.
 * Gọi POST /api/analytics/pageview — chỉ track trên public pages, bỏ qua /admin.
 */
export function usePageTracking() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  useEffect(() => {
    // Bỏ qua admin pages
    if (pathname.startsWith('/admin')) return
    // Không track lại cùng 1 path
    if (pathname === lastTracked.current) return

    lastTracked.current = pathname

    // Fire-and-forget — không block UI
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api'
    fetch(`${apiBase}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Analytics failure không nên ảnh hưởng UX
    })
  }, [pathname])
}
