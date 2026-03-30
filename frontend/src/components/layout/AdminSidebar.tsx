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
      <div className="flex h-[var(--nav-height)] items-center justify-between px-6">
        <Link
          href="/admin"
          className="font-headline text-headline-sm text-primary"
          onClick={() => setMobileOpen(false)}
        >
          {SITE_NAME}
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-on-surface-variant md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
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
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-body-sm transition-all duration-200',
                    isActive
                      ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info + Logout */}
      <div className="bg-surface-container-low/50 px-3 py-4">
        {user && (
          <div className="mb-3 px-4">
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
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-body-sm text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
        >
          <LogOut className="h-5 w-5" />
          Dang xuat
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-[var(--z-sticky)] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-surface-container-low p-2.5 shadow-ambient-sm md:hidden"
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
          'fixed left-0 top-0 z-[var(--z-modal)] flex h-full w-[280px] flex-col bg-surface-container-low transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-[var(--z-sticky)] hidden h-full w-[var(--sidebar-width)] flex-col bg-surface-container-low md:flex">
        {sidebarContent}
      </aside>
    </>
  )
}
