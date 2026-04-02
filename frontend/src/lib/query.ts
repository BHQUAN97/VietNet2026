/**
 * URL search params utilities.
 * Thay the inline parseInt(searchParams.get('page') || '1', 10) pattern.
 */

import type { ReadonlyURLSearchParams } from 'next/navigation'

/** Lay page number tu search params (default 1, min 1) */
export function getPageParam(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
): number {
  const raw = searchParams.get('page')
  if (!raw) return 1
  const page = parseInt(raw, 10)
  return isNaN(page) || page < 1 ? 1 : page
}

/** Lay string param, tra ve undefined neu khong co */
export function getStringParam(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
): string | undefined {
  return searchParams.get(key) || undefined
}

/** Lay number param voi default value */
export function getNumberParam(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  defaultValue: number,
): number {
  const raw = searchParams.get(key)
  if (!raw) return defaultValue
  const num = parseInt(raw, 10)
  return isNaN(num) ? defaultValue : num
}

/**
 * Build query string tu object, bo qua null/undefined/empty.
 * buildQueryString({ page: 2, status: 'published', q: '' })
 * => "page=2&status=published"
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  )
  if (entries.length === 0) return ''
  return entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
}

/**
 * Update 1 param trong current search params, tra ve URL string moi.
 * Dung cho pagination, filter URL state.
 */
export function updateSearchParam(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  value: string | number | null,
  basePath: string,
): string {
  const params = new URLSearchParams(searchParams.toString())
  if (value === null || value === '') {
    params.delete(key)
  } else {
    params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}
