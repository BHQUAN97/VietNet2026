'use client'

interface StatusOption {
  /** Gia tri filter (vd: 'published', 'draft') */
  value: string
  /** Label hien thi */
  label: string
}

interface StatusFilterBarProps {
  /** Danh sach status options */
  options: StatusOption[]
  /** Gia tri dang chon ('' = tat ca) */
  value: string
  /** Callback khi chon status */
  onChange: (value: string) => void
  /** Label cho nut "Tat ca" (default "Tất cả") */
  allLabel?: string
  /** Custom className */
  className?: string
}

/**
 * StatusFilterBar — thanh filter status dung chung cho admin pages.
 * Thay the 5 cho copy-paste filter buttons.
 *
 * Usage:
 * <StatusFilterBar
 *   options={[
 *     { value: 'draft', label: 'Nháp' },
 *     { value: 'published', label: 'Đã đăng' },
 *   ]}
 *   value={statusFilter}
 *   onChange={setStatusFilter}
 * />
 */
export function StatusFilterBar({
  options,
  value,
  onChange,
  allLabel = 'Tất cả',
  className = '',
}: StatusFilterBarProps) {
  const allOptions = [{ value: '', label: allLabel }, ...options]

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {allOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-4 py-2.5 min-h-[44px] text-body-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
