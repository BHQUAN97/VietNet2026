'use client'

import { AlertTriangle } from 'lucide-react'

interface ActionErrorBannerProps {
  /** Error message — null/undefined = an */
  error: string | null | undefined
  /** Callback khi dong */
  onDismiss: () => void
}

/**
 * ActionErrorBanner — error banner chung cho admin pages.
 * Thay the 5+ cho copy-paste error banner giong nhau.
 */
export function ActionErrorBanner({ error, onDismiss }: ActionErrorBannerProps) {
  if (!error) return null

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
      <p className="text-body-sm text-on-error-container">{error}</p>
      <button
        onClick={onDismiss}
        className="ml-auto text-body-sm text-on-error-container underline"
      >
        Đóng
      </button>
    </div>
  )
}
