'use client'

interface FilterOption {
  value: string
  label: string
}

interface FilterChipsProps {
  /** Danh sach options */
  options: FilterOption[]
  /** Gia tri dang chon ('' = tat ca) */
  value: string
  /** Callback khi chon */
  onChange: (value: string) => void
  /** Label cho "Tất cả" chip (default: 'Tất cả') */
  allLabel?: string
}

/**
 * FilterChips — filter chip pattern chung.
 * Thay the inline filter buttons lap di lap lai o catalog, projects, articles.
 */
export function FilterChips({
  options,
  value,
  onChange,
  allLabel = 'Tất cả',
}: FilterChipsProps) {
  const chipClass = (isActive: boolean) =>
    `shrink-0 rounded-xl px-4 py-2.5 min-h-[44px] text-body-sm font-medium transition-all duration-300 ${
      isActive
        ? 'bg-primary-container text-on-primary shadow-ambient-sm'
        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
    }`

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('')}
        className={chipClass(value === '')}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={chipClass(value === opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
