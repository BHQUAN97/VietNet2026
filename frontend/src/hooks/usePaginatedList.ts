'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import { getPageParam, updateSearchParam } from '@/lib/query'
import type { PaginationMeta } from '@/types'

/** Initial SSR data duoc pass tu server page (first-page hydration) */
export interface PaginatedInitialData<T> {
  data: T[]
  total: number
  page: number
}

interface UsePaginatedListOptions<T = unknown> {
  /** API endpoint, vd: '/articles', '/products/admin/list' */
  endpoint: string
  /** So item moi trang (default 20) */
  limit?: number
  /** Extra params gui kem API call (filters, search, ...) */
  params?: Record<string, string | number | boolean | undefined>
  /** Tu dong fetch khi mount (default true) */
  autoFetch?: boolean
  /**
   * Initial data tu SSR. Khi cung cap va URL page === initialData.page,
   * hook se skip fetch lan dau va hydrate thang tu data nay.
   */
  initialData?: PaginatedInitialData<T>
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
 * SSR hydration:
 *   Truyen `initialData` tu server page de skip lan fetch dau neu URL page
 *   trung voi initialData.page. Khi user chuyen trang (hoac doi filter qua URL),
 *   hook tu dong re-fetch nhu binh thuong.
 *
 * Usage (CSR only):
 *   const { items, meta, loading, error, goToPage, isEmpty } = usePaginatedList<Article>({
 *     endpoint: '/articles',
 *     limit: 9,
 *   })
 *
 * Usage (SSR hydrate):
 *   const { items, ... } = usePaginatedList<Article>({
 *     endpoint: '/articles',
 *     limit: 9,
 *     initialData, // { data, total, page }
 *   })
 */
export function usePaginatedList<T>(
  options: UsePaginatedListOptions<T>,
): UsePaginatedListReturn<T> {
  const { endpoint, limit = 20, params = {}, autoFetch = true, initialData } = options
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentPage = getPageParam(searchParams)

  // Neu initialData khop voi URL page hien tai, hydrate thang tu do.
  const canHydrate = !!initialData && initialData.page === currentPage

  const [items, setItems] = useState<T[]>(() =>
    canHydrate ? (initialData as PaginatedInitialData<T>).data : [],
  )
  const [meta, setMeta] = useState<PaginationMeta | null>(() => {
    if (!canHydrate) return null
    const total = (initialData as PaginatedInitialData<T>).total
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1
    return {
      page: (initialData as PaginatedInitialData<T>).page,
      limit,
      total,
      totalPages,
    }
  })
  const [loading, setLoading] = useState(!canHydrate)
  const [error, setError] = useState<string | null>(null)

  // Skip lan fetch dau ngay sau mount khi da hydrate tu SSR.
  // Cac lan params/page thay doi sau do van trigger fetch nhu thuong le.
  const skipNextFetchRef = useRef(canHydrate)

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
    if (!autoFetch) return
    if (skipNextFetchRef.current) {
      // Da hydrate tu SSR, bo qua effect dau tien nhung cho phep fetch o lan sau.
      skipNextFetchRef.current = false
      return
    }
    fetchData()
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
