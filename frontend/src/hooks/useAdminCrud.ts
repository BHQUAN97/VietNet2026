'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import { useAdminList } from './useAdminList'

interface UseAdminCrudOptions {
  /** API endpoint goc (vd: '/products') */
  endpoint: string
  /** Endpoint cho list (default: endpoint + '/admin/list') */
  listEndpoint?: string
  /** So item moi trang (default 20) */
  limit?: number
  /** Extra params gui kem API list call */
  params?: Record<string, string | number | boolean | undefined>
}

interface UseAdminCrudReturn<T> {
  // Tu useAdminList
  items: T[]
  meta: any
  page: number
  loading: boolean
  error: string | null
  goToPage: (page: number) => void
  refresh: () => void
  isEmpty: boolean

  // Action states
  actionError: string | null
  clearActionError: () => void
  deleting: T | null
  setDeleting: (item: T | null) => void
  isDeleting: boolean

  // Action handlers
  /** Xoa item dang o state `deleting`. Goi sau khi user confirm. */
  confirmDelete: () => Promise<void>
  /** Publish item theo id */
  handlePublish: (item: T & { id: string }) => Promise<void>
  /** Create hoac update. id = null -> POST, id = string -> PATCH */
  handleSave: (id: string | null, data: any) => Promise<boolean>
}

/**
 * useAdminCrud — gom state + action logic chung cho admin list pages.
 * Ke thua useAdminList, them: delete confirm, publish, save (create/update).
 *
 * Giam ~150-200 dong boilerplate moi admin page.
 *
 * Usage:
 * const crud = useAdminCrud<Product>({ endpoint: '/products' })
 * // crud.items, crud.handlePublish, crud.confirmDelete, crud.handleSave, ...
 */
export function useAdminCrud<T extends { id: string }>(
  options: UseAdminCrudOptions,
): UseAdminCrudReturn<T> {
  const { endpoint, listEndpoint, limit, params } = options

  // Ke thua useAdminList
  const list = useAdminList<T>({
    endpoint: listEndpoint || `${endpoint}/admin/list`,
    limit,
    params,
  })

  // Action states
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const clearActionError = useCallback(() => setActionError(null), [])

  // ─── Delete ──────────────────────────────────────────────────

  // Stable ref cho refresh — tranh unstable callback khi list object thay doi moi render
  const { refresh } = list

  const confirmDelete = useCallback(async () => {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await api.delete(`${endpoint}/${(deleting as any).id}`)
      setDeleting(null)
      refresh()
    } catch (err) {
      setActionError(getErrorMessage(err))
      setDeleting(null)
    } finally {
      setIsDeleting(false)
    }
  }, [deleting, endpoint, refresh])

  // ─── Publish ─────────────────────────────────────────────────

  const handlePublish = useCallback(
    async (item: T & { id: string }) => {
      try {
        await api.patch(`${endpoint}/${item.id}/publish`)
        refresh()
      } catch (err) {
        setActionError(getErrorMessage(err))
      }
    },
    [endpoint, refresh],
  )

  // ─── Save (create or update) ─────────────────────────────────

  const handleSave = useCallback(
    async (id: string | null, data: any): Promise<boolean> => {
      try {
        if (id) {
          await api.patch(`${endpoint}/${id}`, data)
        } else {
          await api.post(endpoint, data)
        }
        refresh()
        return true
      } catch (err) {
        setActionError(getErrorMessage(err))
        return false
      }
    },
    [endpoint, refresh],
  )

  return {
    ...list,
    actionError,
    clearActionError,
    deleting,
    setDeleting,
    isDeleting,
    confirmDelete,
    handlePublish,
    handleSave,
  }
}
