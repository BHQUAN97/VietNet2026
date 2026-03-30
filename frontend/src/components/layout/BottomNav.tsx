'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Briefcase,
  LayoutGrid,
  MessageCircle,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOTTOM_NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Briefcase,
  LayoutGrid,
  MessageCircle,
  Menu,
}

export function BottomNav() {
  const pathname = usePathname()

  // Hide bottom nav on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[var(--z-fixed)] flex h-[var(--bottom-nav-height)] items-center justify-around border-t bg-surface-container-lowest shadow-bottom-nav md:hidden"
      style={{
        borderTopLeftRadius: 'var(--radius-2xl)',
        borderTopRightRadius: 'var(--radius-2xl)',
        borderColor: 'var(--glass-border)',
      }}
      aria-label="Mobile navigation"
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon]
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant opacity-[var(--opacity-inactive-mobile-nav)]'
            )}
            aria-label={item.label}
          >
            {Icon && <Icon className="h-5 w-5" />}
            <span className="font-label text-[0.625rem] font-bold uppercase tracking-label-wide">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
