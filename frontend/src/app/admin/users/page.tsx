'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UserTable } from '@/components/admin/UserTable'
import { UserFormModal } from '@/components/admin/UserFormModal'
import api from '@/lib/api'
import type { User, ApiResponse, PaginationMeta } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Delete confirmation state
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const LIMIT = 20

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      const response = await api.get<ApiResponse<User[]>>('/users', { params })
      const result = response as unknown as ApiResponse<User[]>
      setUsers(result.data || [])
      setMeta(result.meta || null)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tải danh sách người dùng.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounce search
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  function handleCreate() {
    setEditingUser(null)
    setModalOpen(true)
  }

  function handleEdit(user: User) {
    setEditingUser(user)
    setModalOpen(true)
  }

  function handleDeleteRequest(user: User) {
    setDeletingUser(user)
  }

  async function handleDeleteConfirm() {
    if (!deletingUser) return
    setIsDeleting(true)
    try {
      await api.delete(`/users/${deletingUser.id}`)
      setDeletingUser(null)
      fetchUsers()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa người dùng.'
      setError(message)
      setDeletingUser(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = meta?.totalPages || 1

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">Người dùng</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Quản lý tài khoản người dùng hệ thống.
            {meta && (
              <span className="ml-1 text-body-sm">({meta.total} người dùng)</span>
            )}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
          <p className="text-body-sm text-on-error-container">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-body-sm text-on-error-container underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first, last, current, and neighbors
              if (p === 1 || p === totalPages) return true
              if (Math.abs(p - page) <= 1) return true
              return false
            })
            .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
              if (idx > 0) {
                const prev = arr[idx - 1]
                if (p - prev > 1) acc.push('ellipsis')
              }
              acc.push(p)
              return acc
            }, [])
            .map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-on-surface-variant">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-body-sm font-medium transition-colors duration-200 ${
                    item === page
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {item}
                </button>
              )
            )}
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Tiếp
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
        onSuccess={fetchUsers}
      />

      {/* Delete Confirmation Dialog */}
      {deletingUser && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8">
            <h3 className="font-headline text-headline-sm text-on-surface">
              Xác nhận xóa
            </h3>
            <p className="mt-3 text-body-md text-on-surface-variant">
              Bạn có chắc chắn muốn xóa người dùng{' '}
              <span className="font-semibold text-on-surface">{deletingUser.full_name}</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                loading={isDeleting}
              >
                Xóa người dùng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
