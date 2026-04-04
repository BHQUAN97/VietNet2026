'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { useSocket } from '@/contexts/socket.context'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/date'
import type { RealtimeNotification } from '@/types'

export function NotificationBell() {
  const { notifications, unreadCount, clearNotifications } = useSocket()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  function getTypeLabel(type: string) {
    switch (type) {
      case 'new_consultation':
        return 'Tư vấn'
      case 'page_view_spike':
        return 'Lượt xem'
      default:
        return 'Thông báo'
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
        className={cn(
          'relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl p-2 text-on-surface-variant transition-all duration-200',
          open
            ? 'bg-surface-container-high text-primary'
            : 'hover:bg-surface-container hover:text-on-surface active:bg-surface-container-high'
        )}
        aria-label="Thông báo"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-0.5 text-[10px] font-bold text-on-error">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[var(--z-popover)] mt-1.5 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-surface-container-lowest shadow-ambient-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="font-headline text-body-md font-semibold text-on-surface">
              Thông báo
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-body-sm text-primary transition-opacity hover:opacity-70"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-body-sm text-on-surface-variant">
                Chưa có thông báo nào
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id || `${n.type}-${n.created_at}`}
                    notification={n}
                    getTypeLabel={getTypeLabel}
                    getTypeColor={getTypeColor}
                    onClick={() => {
                      if (n.link) {
                        router.push(n.link)
                        setOpen(false)
                      }
                    }}
                  />
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
  getTypeLabel,
  getTypeColor,
  onClick,
}: {
  notification: RealtimeNotification
  getTypeLabel: (t: string) => string
  getTypeColor: (t: string) => string
  onClick?: () => void
}) {
  return (
    <li
      className={cn(
        'px-4 py-2.5 transition-colors hover:bg-surface-container',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            'mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase',
            getTypeColor(notification.type),
          )}
        >
          {getTypeLabel(notification.type)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-medium text-on-surface">
            {notification.title}
          </p>
          {notification.body && (
            <p className="mt-0.5 text-body-sm text-on-surface-variant line-clamp-2">
              {notification.body}
            </p>
          )}
          <p className="mt-1 text-[11px] text-on-surface-variant/60">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>
      </div>
    </li>
  )
}
