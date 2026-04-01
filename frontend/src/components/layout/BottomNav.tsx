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
      className="fixed bottom-0 left-0 right-0 z-[var(--z-fixed)] flex h-[var(--bottom-nav-height)] items-center justify-around md:hidden"
      style={{
        backgroundColor: 'rgba(255, 251, 248, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(212, 195, 186, 0.1)',
        borderTopLeftRadius: 'var(--radius-2xl)',
        borderTopRightRadius: 'var(--radius-2xl)',
        boxShadow: '0 -4px 24px rgba(85, 55, 34, 0.06)',
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
              'relative flex flex-col items-center gap-1 px-3 py-2 transition-all duration-300',
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant/50'
            )}
            aria-label={item.label}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute -top-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-primary animate-scale-in" />
            )}
            {Icon && <Icon className={cn('h-5 w-5 transition-transform duration-300', isActive && 'scale-105')} />}
            <span className="font-label text-[0.6rem] font-bold uppercase tracking-label-wide">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
