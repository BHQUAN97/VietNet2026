/**
 * Returns the API base URL for server-side fetching.
 * In Docker: uses INTERNAL_API_URL (http://backend:4000/api) to reach backend via internal network.
 * Fallback: uses NEXT_PUBLIC_API_URL or localhost.
 */
export function getServerApiUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api'
  )
}

/**
 * Chuyen relative media URL (/uploads/...) thanh absolute URL.
 * SSR: dung INTERNAL_API_URL (backend container).
 * Client: dung window.location.origin.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (!url.startsWith('/uploads/')) return url

  // SSR context — prepend backend origin
  if (typeof window === 'undefined') {
    const internal = process.env.INTERNAL_API_URL || 'http://localhost:4000/api'
    const origin = internal.replace(/\/api\/?$/, '')
    return origin + url
  }

  // Client context
  return window.location.origin + url
}
