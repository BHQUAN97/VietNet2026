'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ZALO_URL = process.env.NEXT_PUBLIC_ZALO_URL || 'https://zalo.me/vietnetinterior'
const MESSENGER_URL = process.env.NEXT_PUBLIC_MESSENGER_URL || 'https://m.me/vietnetinterior'
const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE || 'tel:0901234567'

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.03 2 11c0 2.76 1.35 5.22 3.46 6.87V22l3.84-2.11c.87.24 1.78.36 2.7.36 5.52 0 10-4.03 10-9S17.52 2 12 2zm.97 12.15H9.63c-.18 0-.32-.14-.32-.32s.14-.32.32-.32h3.34c.18 0 .32.14.32.32s-.14.32-.32.32zm2.4-2.4H8.63c-.18 0-.32-.14-.32-.32 0-.18.14-.32.32-.32h6.74c.18 0 .32.14.32.32 0 .18-.14.32-.32.32zm0-2.4H8.63c-.18 0-.32-.14-.32-.32 0-.18.14-.32.32-.32h6.74c.18 0 .32.14.32.32 0 .18-.14.32-.32.32z" />
    </svg>
  )
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.18.16.15.26.36.27.58l.05 1.82c.02.56.6.92 1.1.68l2.03-.9c.17-.08.36-.1.55-.06.6.16 1.24.25 1.85.25 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm5.95 7.55-2.92 4.63c-.46.74-1.45.92-2.13.4l-2.32-1.74a.6.6 0 0 0-.72 0l-3.13 2.38c-.42.32-.97-.18-.69-.63l2.92-4.63c.47-.74 1.45-.92 2.13-.4l2.32 1.74a.6.6 0 0 0 .72 0l3.13-2.38c.42-.32.97.18.69.63z" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

const widgets = [
  {
    href: ZALO_URL,
    label: 'Chat Zalo',
    icon: ZaloIcon,
    bgClass: 'bg-tertiary hover:bg-tertiary/90',
  },
  {
    href: MESSENGER_URL,
    label: 'Chat Messenger',
    icon: MessengerIcon,
    bgClass: 'bg-secondary hover:bg-secondary/90',
  },
  {
    href: PHONE_NUMBER,
    label: 'Gọi điện',
    icon: PhoneIcon,
    bgClass: 'bg-primary-container hover:bg-primary',
  },
]

export function FloatingWidgets() {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* ── Desktop: hien tat ca 3 buttons ── */}
      <div
        className="fixed right-4 z-[var(--z-fixed)] hidden flex-col gap-3 md:bottom-8 md:flex"
        aria-label="Liên hệ nhanh"
        role="group"
      >
        {widgets.map((widget, index) => {
          const Icon = widget.icon
          return (
            <div key={widget.label} className="relative flex items-center justify-end">
              <span
                className={cn(
                  'absolute right-14 whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5 font-label text-label-lg text-inverse-on-surface shadow-ambient-sm transition-all duration-300',
                  hoveredIndex === index
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-2 opacity-0 pointer-events-none'
                )}
              >
                {widget.label}
              </span>
              <a
                href={widget.href}
                target={widget.href.startsWith('tel:') ? undefined : '_blank'}
                rel={widget.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                aria-label={widget.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-on-primary shadow-ambient-md transition-all duration-300 hover:scale-110 hover:shadow-ambient-lg',
                  widget.bgClass
                )}
              >
                <Icon className="h-6 w-6" />
              </a>
            </div>
          )
        })}
      </div>

      {/* ── Mobile: 1 FAB toggle, click expand 3 actions ── */}
      <div
        className="fixed right-4 z-[var(--z-fixed)] bottom-[calc(var(--bottom-nav-height)+1rem)] md:hidden"
        aria-label="Liên hệ nhanh"
        role="group"
      >
        {/* Expanded actions — show lên trên FAB */}
        <div className={cn(
          'flex flex-col-reverse gap-2.5 mb-2.5 transition-all duration-300 origin-bottom',
          mobileOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-75 opacity-0 pointer-events-none'
        )}>
          {widgets.map((widget, i) => {
            const Icon = widget.icon
            return (
              <a
                key={widget.label}
                href={widget.href}
                target={widget.href.startsWith('tel:') ? undefined : '_blank'}
                rel={widget.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                aria-label={widget.label}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms' }}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full text-on-primary shadow-ambient-md transition-all duration-200 active:scale-90',
                  widget.bgClass
                )}
              >
                <Icon className="h-5 w-5" />
              </a>
            )
          })}
        </div>

        {/* Toggle FAB */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Đóng liên hệ' : 'Liên hệ nhanh'}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shadow-ambient-lg transition-all duration-300 active:scale-90',
            mobileOpen
              ? 'bg-inverse-surface text-inverse-on-surface'
              : 'bg-primary-container text-on-primary animate-widget-pulse'
          )}
        >
          <MessageCircle className={cn(
            'h-6 w-6 absolute transition-all duration-300',
            mobileOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
          )} />
          <X className={cn(
            'h-6 w-6 absolute transition-all duration-300',
            mobileOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
          )} />
        </button>
      </div>

      {/* Mobile backdrop khi FAB mo */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[calc(var(--z-fixed)-1)] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
