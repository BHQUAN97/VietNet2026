'use client'

import { usePathname } from 'next/navigation'
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
        <AuthGuard>
          <div className="min-h-screen bg-surface">
            <AdminSidebar />
            <div className="min-h-screen md:ml-[var(--sidebar-width)]">
              {/* Top bar with notification bell */}
              <div className="flex items-center justify-end px-6 py-3 pl-16 md:pl-6">
                <NotificationBell />
              </div>
              <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</div>
            </div>
          </div>
        </AuthGuard>
      </SocketProvider>
    </AuthProvider>
  )
}
