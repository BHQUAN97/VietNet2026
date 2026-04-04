'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/auth.context'
import { SocketProvider } from '@/contexts/socket.context'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { NotificationBell } from '@/components/admin/NotificationBell'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Login page uses full-width layout without sidebar or auth guard
  if (pathname === '/admin/login') {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <AuthGuard requireAdmin>
          <div className="min-h-screen bg-surface">
            <AdminSidebar />
            <div className="min-h-screen md:ml-[var(--sidebar-width)]">
              {/* Top bar with notification bell */}
              <div className="flex items-center justify-between px-4 py-2.5 pl-14 md:justify-end md:px-6 md:pl-6 md:py-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-headline text-title-sm text-primary transition-opacity hover:opacity-80 md:hidden"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8">
                    <span className="font-headline text-body-sm text-primary">V</span>
                  </span>
                  VietNet
                </Link>
                <NotificationBell />
              </div>
              {/* No footer in admin */}
              <div className="mx-auto max-w-7xl px-4 pb-8 md:px-6">{children}</div>
            </div>
          </div>
        </AuthGuard>
      </SocketProvider>
    </AuthProvider>
  )
}
