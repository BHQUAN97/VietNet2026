'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  /** Hien thi dialog khi true */
  open: boolean
  /** Tieu de (default: 'Xác nhận xóa') */
  title?: string
  /** Noi dung xac nhan — co the la JSX */
  message: React.ReactNode
  /** Label nut confirm (default: 'Xóa') */
  confirmLabel?: string
  /** Variant nut confirm (default: 'danger') */
  confirmVariant?: 'danger' | 'primary'
  /** Dang xu ly — disable buttons */
  loading?: boolean
  /** Callback khi confirm */
  onConfirm: () => void
  /** Callback khi huy */
  onCancel: () => void
}

/**
 * ConfirmDialog — modal xac nhan chung, thay the 5+ cho delete modal copy-paste.
 *
 * Usage:
 * <ConfirmDialog
 *   open={!!deletingItem}
 *   message={<>Bạn có chắc muốn xóa <b>{item.name}</b>?</>}
 *   loading={isDeleting}
 *   onConfirm={handleDelete}
 *   onCancel={() => setDeletingItem(null)}
 * />
 */
export function ConfirmDialog({
  open,
  title = 'Xác nhận xóa',
  message,
  confirmLabel = 'Xóa',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Escape de dong
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8">
        <h3 className="font-headline text-headline-sm text-on-surface">
          {title}
        </h3>
        <div className="mt-3 text-body-md text-on-surface-variant">
          {message}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
