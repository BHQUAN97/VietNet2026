'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 overflow-x-auto text-body-sm', className)}
    >
      <Link
        href="/"
        className="text-on-surface-variant transition-colors hover:text-primary"
      >
        Trang chủ
      </Link>

      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-outline-variant" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate max-w-[200px] text-on-surface">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
