'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useSocket } from '@/contexts/socket.context'
import { cn } from '@/lib/utils'
import type { RealtimeNotification } from '@/types'

export function NotificationBell() {
  const { notifications, unreadCount, clearNotifications } = useSocket()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel on outside click or Escape key
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleToggle() {
    setOpen((prev) => !prev)
    if (!open && unreadCount > 0) {
      clearNotifications()
    }
  }

  function formatTime(dateStr: string | Date) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Vua xong'
    if (diffMin < 60) return `${diffMin} phut truoc`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} gio truoc`
    return `${Math.floor(diffHour / 24)} ngay truoc`
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'new_consultation':
        return 'Tu van'
      case 'page_view_spike':
        return 'Luot xem'
      default:
        return 'Thong bao'
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'new_consultation':
        return 'bg-primary/10 text-primary'
      case 'page_view_spike':
        return 'bg-tertiary/10 text-tertiary'
      default:
        return 'bg-secondary/10 text-secondary'
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleToggle}
        className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-high"
        aria-label="Thong bao"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-label-sm text-on-error">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[var(--z-popover)] mt-2 w-80 rounded-2xl bg-surface-container-low shadow-ambient-lg">
          <div className="flex items-center justify-between bg-surface-container px-4 py-3 rounded-t-2xl">
            <h3 className="font-headline text-title-sm text-on-surface">
              Thong bao
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-label-sm text-primary hover:underline"
              >
                Doc tat ca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-body-sm text-on-surface-variant">
                Chua co thong bao nao
              </div>
            ) : (
              <ul>
                {notifications.map((n, i) => (
                  <NotificationItem key={i} notification={n} formatTime={formatTime} getTypeLabel={getTypeLabel} getTypeColor={getTypeColor} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItem({
  notification,
  formatTime,
  getTypeLabel,
  getTypeColor,
}: {
  notification: RealtimeNotification
  formatTime: (d: string | Date) => string
  getTypeLabel: (t: string) => string
  getTypeColor: (t: string) => string
}) {
  return (
    <li className="px-4 py-3 transition-colors hover:bg-surface-container">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 inline-block rounded-lg px-2 py-0.5 text-label-sm',
            getTypeColor(notification.type),
          )}
        >
          {getTypeLabel(notification.type)}
        </span>
        <div className="flex-1">
          <p className="text-body-sm font-medium text-on-surface">
            {notification.title}
          </p>
          {notification.body && (
            <p className="mt-0.5 text-body-sm text-on-surface-variant line-clamp-2">
              {notification.body}
            </p>
          )}
          <p className="mt-1 text-label-sm text-on-surface-variant/60">
            {formatTime(notification.created_at)}
          </p>
        </div>
      </div>
    </li>
  )
}
