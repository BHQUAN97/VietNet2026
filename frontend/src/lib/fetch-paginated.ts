import { getServerApiUrl } from './api-url'
import type { PaginationMeta } from '@/types'

/** BE pagination envelope (copy tu response.helper.ts cua backend) */
interface PaginatedEnvelope<T> {
  success: boolean
  data: T[]
  message?: string
  meta?: PaginationMeta
}

export interface FetchPaginatedResult<T> {
  data: T[]
  total: number
  page: number
}

export interface FetchPaginatedOptions {
  /** API path bat dau bang '/', vd '/articles', '/products' */
  endpoint: string
  page?: number
  limit?: number
  /** Query params bo sung (category, material_type, ...) */
  params?: Record<string, string | number | undefined>
  /** ISR revalidate (giay). Default 60. */
  revalidate?: number
  /** Cache tags cho on-demand revalidation */
  tags?: string[]
  /** Timeout ms. Default 10000. */
  timeoutMs?: number
}

/**
 * Server-side paginated fetch helper — dung cho SSR first-page hydration.
 * Tra ve null khi fetch fail de caller co the fallback sang CSR.
 */
export async function fetchPaginated<T>(
  opts: FetchPaginatedOptions,
): Promise<FetchPaginatedResult<T> | null> {
  const {
    endpoint,
    page = 1,
    limit = 12,
    params = {},
    revalidate = 60,
    tags,
    timeoutMs = 10000,
  } = opts

  const base = getServerApiUrl()
  const url = new URL(`${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', String(limit))
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '' || v === null) continue
    url.searchParams.set(k, String(v))
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url.toString(), {
      next: { revalidate, ...(tags ? { tags } : {}) },
      signal: controller.signal,
    })
    if (!res.ok) return null
    const json = (await res.json()) as PaginatedEnvelope<T>
    if (!json.success || !Array.isArray(json.data)) return null
    return {
      data: json.data,
      total: json.meta?.total ?? json.data.length,
      page: json.meta?.page ?? page,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
