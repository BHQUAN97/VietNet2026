'use client'

import { useState, useEffect } from 'react'

/**
 * Debounce hook — delay value update.
 * Dung cho search input de giam API calls.
 *
 * Usage:
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 300)
 * // debouncedSearch chi update sau 300ms khong co thay doi
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
