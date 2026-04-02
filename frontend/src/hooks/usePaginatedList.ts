'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import { getPageParam, updateSearchParam } from '@/lib/query'
import type { PaginationMeta } from '@/types'

interface UsePaginatedListOptions {
  /** API endpoint, vd: '/articles', '/products/admin/list' */
  endpoint: string
  /** So item moi trang (default 20) */
  limit?: number
  /** Extra params gui kem API call (filters, search, ...) */
  params?: Record<string, string | number | boolean | undefined>
  /** Tu dong fetch khi mount (default true) */
  autoFetch?: boolean
}

interface UsePaginatedListReturn<T> {
  /** Data items */
  items: T[]
  /** Pagination meta */
  meta: PaginationMeta | null
  /** Current page */
  page: number
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Go to page */
  goToPage: (page: number) => void
  /** Refetch data */
  refresh: () => void
  /** Is empty (no items, not loading, no error) */
  isEmpty: boolean
}

/**
 * Generic paginated list hook.
 * Thay the 7+ pages copy-paste fetch + pagination + loading/error logic.
 *
 * Usage:
 * const { items, meta, loading, error, goToPage, isEmpty } = usePaginatedList<Article>({
 *   endpoint: '/articles',
 *   limit: 9,
 *   params: { status: statusFilter },
 * })
 */
export function usePaginatedList<T>(
  options: UsePaginatedListOptions,
): UsePaginatedListReturn<T> {
  const { endpoint, limit = 20, params = {}, autoFetch = true } = options
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentPage = getPageParam(searchParams)

  const [items, setItems] = useState<T[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Build params, bo qua undefined values
      const apiParams: Record<string, string | number> = {
        page: currentPage,
        limit,
      }
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '' && value !== false) {
          apiParams[key] = value as string | number
        }
      }

      const res: any = await api.get(endpoint, { params: apiParams })
      setItems(res.data || [])
      setMeta(res.meta || null)
    } catch (err) {
      setError(getErrorMessage(err))
      setItems([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, currentPage, limit, JSON.stringify(params)])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [fetchData, autoFetch])

  const goToPage = useCallback(
    (page: number) => {
      const url = updateSearchParam(searchParams, 'page', page <= 1 ? null : page, pathname)
      router.push(url)
    },
    [searchParams, pathname, router],
  )

  const isEmpty = !loading && !error && items.length === 0

  return {
    items,
    meta,
    page: currentPage,
    loading,
    error,
    goToPage,
    refresh: fetchData,
    isEmpty,
  }
}
