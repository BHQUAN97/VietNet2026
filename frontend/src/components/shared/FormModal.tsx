'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface FormModalProps {
  /** Hien thi modal khi true */
  open: boolean
  /** Tieu de modal */
  title: string
  /** Phu de (vd: 'Ctrl+S để lưu · Esc để đóng') */
  subtitle?: string
  /** Dang luu — disable buttons */
  loading?: boolean
  /** Max width container (default 'max-w-3xl') */
  maxWidth?: string
  /** Form submit handler */
  onSubmit: (e: React.FormEvent) => void
  /** Dong modal */
  onClose: () => void
  /** Form fields — render trong scrollable area */
  children: React.ReactNode
  /** Custom footer — null de an, undefined dung default (Cancel + Submit) */
  footer?: React.ReactNode | null
  /** Label nut submit (default: 'Lưu') */
  submitLabel?: string
}

/**
 * FormModal — base modal cho create/edit forms.
 * Auto: Escape dong, Ctrl+S submit, sticky header/footer, scrollable body.
 *
 * Usage:
 * <FormModal open={modalOpen} title="Thêm sản phẩm" loading={saving}
 *   onSubmit={handleSave} onClose={() => setModalOpen(false)}>
 *   <FormFields />
 * </FormModal>
 */
export function FormModal({
  open,
  title,
  subtitle = 'Ctrl+S để lưu · Esc để đóng',
  loading = false,
  maxWidth = 'max-w-3xl',
  onSubmit,
  onClose,
  children,
  footer,
  submitLabel = 'Lưu',
}: FormModalProps) {
  const formRef = useRef<HTMLFormElement>(null)

  // Phim tat: Escape dong, Ctrl+S luu
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault()
        onClose()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (!loading) formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
      <div className={`mx-4 flex max-h-[90vh] w-full ${maxWidth} flex-col rounded-2xl bg-surface shadow-ambient-lg`}>
        {/* Sticky header */}
        <div className="shrink-0 rounded-t-2xl bg-surface-container-low px-6 py-5 md:px-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-headline-sm text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <span className="hidden text-body-sm text-on-surface-variant/60 sm:block">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Form voi scrollable body + sticky footer */}
        <form ref={formRef} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8">
            {children}
          </div>

          {/* Footer — default hoac custom */}
          {footer !== null && (
            <div className="shrink-0 rounded-b-2xl bg-surface-container-low px-6 py-4 md:px-8">
              {footer !== undefined ? (
                footer
              ) : (
                <div className="flex items-center justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
                    Hủy
                  </Button>
                  <Button type="submit" loading={loading}>
                    {submitLabel}
                  </Button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
