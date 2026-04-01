'use client'

import { Badge } from '@/components/ui/Badge'

/**
 * StatusBadge — reusable badge cho trang thai bai viet / du an
 * Map status string sang variant + label tuong ung
 */

type StatusType = 'published' | 'draft' | 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'new' | 'contacted'

const STATUS_MAP: Record<StatusType, { label: string; variant: 'success' | 'neutral' | 'warning' | 'info' | 'error'; dot?: boolean }> = {
  published:  { label: 'Published',   variant: 'success',  dot: true },
  draft:      { label: 'Draft',       variant: 'neutral' },
  pending:    { label: 'Pending',     variant: 'warning',  dot: true },
  scheduled:  { label: 'Scheduled',   variant: 'info',     dot: true },
  completed:  { label: 'Completed',   variant: 'success' },
  cancelled:  { label: 'Cancelled',   variant: 'neutral' },
  new:        { label: 'Mới',         variant: 'warning',  dot: true },
  contacted:  { label: 'Đã liên hệ', variant: 'info' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status as StatusType] || { label: status, variant: 'neutral' as const }

  return (
    <Badge variant={config.variant} dot={config.dot} size="sm" className={className}>
      {config.label}
    </Badge>
  )
}
