import { getServerApiUrl } from './api-url'

const API_URL = getServerApiUrl()

interface ServerFetchOptions {
  /** ISR revalidate (seconds). Default: 3600 (1h) */
  revalidate?: number | false
  /** Cache tags cho on-demand revalidation */
  tags?: string[]
  /** Timeout ms. Default: 10000 (10s) */
  timeout?: number
  /** Fallback khi loi. Default: null */
  fallback?: any
}

/**
 * serverFetch — utility chung cho server-side data fetching.
 * Gom: AbortController + timeout + unwrap json.data + error handling.
 * Thay the 6+ fetch functions copy-paste o detail pages.
 *
 * Usage:
 * const product = await serverFetch<Product>(`/products/${slug}`, {
 *   tags: ['products', `product-${slug}`],
 * })
 */
export async function serverFetch<T>(
  path: string,
  options?: ServerFetchOptions,
): Promise<T | null> {
  const {
    revalidate = 3600,
    tags,
    timeout = 10000,
    fallback = null,
  } = options || {}

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: {
        revalidate: revalidate === false ? 0 : revalidate,
        ...(tags ? { tags } : {}),
      },
      signal: controller.signal,
    })

    if (!res.ok) return fallback

    const json = await res.json()
    return (json.data as T) ?? fallback
  } catch {
    return fallback
  } finally {
    clearTimeout(timer)
  }
}

/**
 * serverFetchList — fetch list endpoint, return array.
 * Unwrap json.data va filter ket qua.
 */
export async function serverFetchList<T>(
  path: string,
  options?: ServerFetchOptions & { excludeId?: string },
): Promise<T[]> {
  const { excludeId, ...fetchOptions } = options || {}

  const result = await serverFetch<T[]>(path, {
    ...fetchOptions,
    fallback: [],
  })

  const items = result || []

  if (excludeId) {
    return items.filter((item: any) => item.id !== excludeId)
  }

  return items
}
