'use client'

import { AlertTriangle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LoadingSpinnerProps {
  /** Min height container (default min-h-[40vh]) */
  minHeight?: string
}

/** Loading spinner — chuan cho tat ca pages */
export function LoadingSpinner({ minHeight = 'min-h-[40vh]' }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex ${minHeight} items-center justify-center`}
      role="status"
      aria-label="Đang tải"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

interface ErrorDisplayProps {
  /** Error message */
  message: string
  /** Retry callback */
  onRetry?: () => void
  /** Min height (default min-h-[40vh]) */
  minHeight?: string
}

/** Error state — hien thi loi va nut thu lai */
export function ErrorDisplay({ message, onRetry, minHeight = 'min-h-[40vh]' }: ErrorDisplayProps) {
  return (
    <div className={`flex ${minHeight} flex-col items-center justify-center text-center`}>
      <AlertTriangle className="mb-3 h-8 w-8 text-error/60" />
      <p className="text-body-lg text-error">{message}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-4" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  /** Message khi khong co data */
  message?: string
  /** Icon (default Inbox) */
  icon?: React.ReactNode
  /** Min height (default min-h-[40vh]) */
  minHeight?: string
  /** Action button */
  action?: {
    label: string
    onClick: () => void
  }
}

/** Empty state — khi khong co data */
export function EmptyState({
  message = 'Chưa có dữ liệu.',
  icon,
  minHeight = 'min-h-[40vh]',
  action,
}: EmptyStateProps) {
  return (
    <div className={`flex ${minHeight} flex-col items-center justify-center text-center`}>
      {icon || <Inbox className="mb-3 h-10 w-10 text-on-surface-variant/30" />}
      <p className="text-body-lg text-on-surface-variant">{message}</p>
      {action && (
        <Button variant="ghost" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface DataStatesProps {
  /** Loading state */
  loading: boolean
  /** Error message (null = no error) */
  error: string | null
  /** Is empty (true = no items) */
  isEmpty: boolean
  /** Retry callback */
  onRetry?: () => void
  /** Empty message */
  emptyMessage?: string
  /** Children — chi render khi co data */
  children: React.ReactNode
  /** Min height cho states */
  minHeight?: string
}

/**
 * DataStates — compound component boc loading/error/empty/data.
 * Thay the 8+ cho copy-paste 3 conditional blocks.
 *
 * Usage:
 * <DataStates loading={loading} error={error} isEmpty={isEmpty} onRetry={refresh}>
 *   {renderContent()}
 * </DataStates>
 */
export function DataStates({
  loading,
  error,
  isEmpty,
  onRetry,
  emptyMessage,
  children,
  minHeight,
}: DataStatesProps) {
  if (loading) return <LoadingSpinner minHeight={minHeight} />
  if (error) return <ErrorDisplay message={error} onRetry={onRetry} minHeight={minHeight} />
  if (isEmpty) return <EmptyState message={emptyMessage} minHeight={minHeight} />
  return <>{children}</>
}
