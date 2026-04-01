'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Briefcase,
  LayoutGrid,
  MessageCircle,
  Menu,
  X,
  Search,
  User,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOTTOM_NAV_ITEMS, NAV_LINKS } from '@/lib/constants'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Briefcase,
  LayoutGrid,
  MessageCircle,
  Menu,
}

// Cac link phu hien thi khi bam Menu
const EXTRA_LINKS = [
  { label: 'Tìm kiếm', href: '/search', icon: Search },
  { label: 'Bài viết', href: '/articles', icon: FileText },
  { label: 'Tài khoản', href: '/admin/login', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Dong menu khi chuyen trang
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Hide bottom nav on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* Menu overlay panel — slide up from bottom */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[calc(var(--z-fixed)-2)] bg-on-surface/10 animate-fade-in md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="fixed bottom-[var(--bottom-nav-height)] left-0 right-0 z-[calc(var(--z-fixed)-1)] animate-slide-up md:hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderTopLeftRadius: 'var(--radius-2xl)',
              borderTopRightRadius: 'var(--radius-2xl)',
              boxShadow: '0 -8px 32px rgba(85, 55, 34, 0.08)',
            }}
          >
            <div className="px-5 pb-4 pt-5">
              <p className="mb-3 font-label text-label-md uppercase tracking-[0.1em] text-on-surface-variant/60">
                Khám phá
              </p>
              <div className="flex flex-col gap-1">
                {EXTRA_LINKS.map((link, i) => {
                  const Icon = link.icon
                  const isActive = pathname.startsWith(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 font-label text-label-lg uppercase tracking-label-wide transition-all duration-200 active:scale-[0.98]',
                        isActive
                          ? 'bg-primary-container/10 text-primary-container'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      )}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[var(--z-fixed)] flex h-[var(--bottom-nav-height)] items-center justify-around px-4 pb-safe md:hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-2xl)',
          borderTopRightRadius: 'var(--radius-2xl)',
          boxShadow: '0 -4px 24px rgba(85, 55, 34, 0.06)',
        }}
        aria-label="Mobile navigation"
      >
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon]
          const isMenu = item.href === '#menu'
          const isActive = isMenu
            ? menuOpen
            : item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          // Menu item toggles the panel
          if (isMenu) {
            return (
              <button
                key={item.href}
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  'flex flex-col items-center justify-center transition-transform duration-200 active:scale-90',
                  menuOpen
                    ? 'rounded-xl bg-primary-container/10 px-3 py-1 text-primary-container'
                    : 'px-3 py-1 text-on-surface-variant/50 hover:text-primary'
                )}
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              >
                <span className="relative h-5 w-5">
                  <Menu className={cn(
                    'absolute inset-0 h-5 w-5 transition-all duration-300',
                    menuOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
                  )} />
                  <X className={cn(
                    'absolute inset-0 h-5 w-5 transition-all duration-300',
                    menuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
                  )} />
                </span>
                <span className="mt-1 font-label text-[10px] font-medium uppercase tracking-[0.1em]">
                  {menuOpen ? 'Đóng' : item.label}
                </span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center transition-transform duration-200 active:scale-90',
                isActive
                  ? 'rounded-xl bg-primary-container/10 px-3 py-1 text-primary-container'
                  : 'px-3 py-1 text-on-surface-variant/50 hover:text-primary'
              )}
              aria-label={item.label}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="mt-1 font-label text-[10px] font-medium uppercase tracking-[0.1em]">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
