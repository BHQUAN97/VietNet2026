'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(
  apiCall: (...args: unknown[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await apiCall(...args)

        if (response.success && response.data !== null) {
          setState({ data: response.data, loading: false, error: null })
          return response.data
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || 'An error occurred',
          })
          return null
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setState({ data: null, loading: false, error: message })
        return null
      }
    },
    [apiCall]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}
