'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import type { PaginationMeta } from '@/types'

interface UseAdminListOptions {
  /** API endpoint, vd: '/consultations', '/products/admin/list' */
  endpoint: string
  /** So item moi trang (default 20) */
  limit?: number
  /** Extra params gui kem API call (filters, search, ...) */
  params?: Record<string, string | number | boolean | undefined>
}

interface UseAdminListReturn<T> {
  items: T[]
  meta: PaginationMeta | null
  page: number
  loading: boolean
  error: string | null
  /** Chuyen trang */
  goToPage: (page: number) => void
  /** Refetch data (giu nguyen page) */
  refresh: () => void
  /** Clear error */
  clearError: () => void
  /** Empty state: no items, not loading, no error */
  isEmpty: boolean
}

/**
 * Hook chung cho admin list pages.
 * Thay the ~30 dong boilerplate (useState x6, fetchFn, useEffect).
 * Khac usePaginatedList: dung local state (khong URL params), khong can Suspense.
 * Tu dong reset page ve 1 khi params thay doi (dung synchronous state pattern).
 */
export function useAdminList<T>(options: UseAdminListOptions): UseAdminListReturn<T> {
  const { endpoint, limit = 20, params = {} } = options

  const [items, setItems] = useState<T[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto-reset page khi params thay doi.
  // Dung React "adjusting state during render" pattern (khong dung useEffect)
  // de tranh double fetch: setState trong render -> React re-render ngay voi state moi.
  const paramsKey = JSON.stringify(params)
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey)

  if (prevParamsKey !== paramsKey) {
    setPrevParamsKey(paramsKey)
    setPage(1)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const apiParams: Record<string, string | number> = { page, limit }
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
  }, [endpoint, page, limit, paramsKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const goToPage = useCallback((p: number) => setPage(p), [])
  const clearError = useCallback(() => setError(null), [])
  const isEmpty = !loading && !error && items.length === 0

  return { items, meta, page, loading, error, goToPage, refresh: fetchData, clearError, isEmpty }
}
