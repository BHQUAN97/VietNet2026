'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { PaginationMeta } from '@/types'

interface PaginationProps {
  /** Pagination meta tu API */
  meta: PaginationMeta | null
  /** Current page */
  currentPage: number
  /** Callback khi chuyen trang */
  onPageChange: (page: number) => void
  /** Variant: 'simple' (prev/next) hoac 'numbered' (page numbers) */
  variant?: 'simple' | 'numbered'
  /** So page buttons hien thi (chi cho variant numbered, default 5) */
  maxButtons?: number
}

/**
 * Pagination component thong nhat.
 * Thay the 5 implementations khac nhau across pages.
 */
export function Pagination({
  meta,
  currentPage,
  onPageChange,
  variant = 'simple',
  maxButtons = 5,
}: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null

  if (variant === 'simple') {
    return (
      <div className="mt-12 flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Trước
        </Button>
        <span className="px-4 text-body-md text-on-surface-variant">
          {currentPage} / {meta.totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage >= meta.totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang sau"
        >
          Sau
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Numbered variant
  const pages = getPageNumbers(currentPage, meta.totalPages, maxButtons)

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-10 w-10 items-center justify-center text-on-surface-variant"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`flex h-10 min-h-[44px] w-10 items-center justify-center rounded-full text-body-sm font-medium transition-colors ${
              currentPage === p
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
            aria-label={`Trang ${p}`}
            aria-current={currentPage === p ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage >= meta.totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

/** Tinh toan page numbers voi ellipsis */
function getPageNumbers(
  current: number,
  total: number,
  maxButtons: number,
): (number | '...')[] {
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []
  const half = Math.floor(maxButtons / 2)

  let start = Math.max(2, current - half)
  let end = Math.min(total - 1, current + half)

  // Adjust if near edges
  if (current <= half + 1) {
    end = maxButtons - 1
  }
  if (current >= total - half) {
    start = total - maxButtons + 2
  }

  pages.push(1)
  if (start > 2) pages.push('...')

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < total - 1) pages.push('...')
  pages.push(total)

  return pages
}
