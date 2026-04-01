'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Package,
  MessageCircle,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ADMIN_NAV_ITEMS, SITE_NAME } from '@/lib/constants'
import { useAuth } from '@/contexts/auth.context'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  Briefcase,
  Package,
  MessageCircle,
  BarChart3,
  Users,
  Settings,
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-[var(--nav-height)] items-center justify-between px-5">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 font-headline text-title-lg text-primary transition-opacity hover:opacity-80"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
            <span className="font-headline text-body-md text-primary">V</span>
          </span>
          {SITE_NAME}
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-high md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3">
        <ul className="flex flex-col gap-0.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm transition-all duration-200',
                    isActive
                      ? 'bg-primary-container/15 text-primary font-semibold shadow-ambient-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:bg-surface-container-highest'
                  )}
                >
                  {Icon && <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-primary')} />}
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-surface-container-high/50 px-3 py-3">
        {user && (
          <div className="mb-2 px-4">
            <p className="truncate text-body-sm font-semibold text-on-surface">
              {user.full_name}
            </p>
            <p className="truncate text-body-sm text-on-surface-variant">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm text-on-surface-variant transition-all duration-200 hover:bg-error-container/50 hover:text-on-error-container active:bg-error-container"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Đăng xuất
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[var(--z-sticky)] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-surface-container-low p-2.5 shadow-ambient-sm transition-all duration-200 hover:shadow-ambient-md active:scale-95 md:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5 text-on-surface" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-on-surface/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-[var(--z-modal)] flex h-full w-[272px] flex-col bg-surface-container-lowest transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-[var(--z-sticky)] hidden h-full w-[var(--sidebar-width)] flex-col border-r border-surface-container-high/30 bg-surface-container-lowest md:flex">
        {sidebarContent}
      </aside>
    </>
  )
}
