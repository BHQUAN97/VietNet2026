'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { ActionErrorBanner } from '@/components/shared/ActionErrorBanner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { UserTable } from '@/components/admin/UserTable'
import { UserFormModal } from '@/components/admin/UserFormModal'
import { getErrorMessage } from '@/lib/error'
import api from '@/lib/api'
import type { User } from '@/types'
import { useAdminList } from '@/hooks/useAdminList'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    items: users, meta, page, loading: isLoading,
    goToPage, refresh,
  } = useAdminList<User>({
    endpoint: '/users',
    params: { search: searchQuery.trim() || undefined },
  })

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Delete state
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleCreate() {
    setEditingUser(null)
    setModalOpen(true)
  }

  function handleEdit(user: User) {
    setEditingUser(user)
    setModalOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deletingUser) return
    setIsDeleting(true)
    try {
      await api.delete(`/users/${deletingUser.id}`)
      setDeletingUser(null)
      refresh()
    } catch (err: unknown) {
      setActionError(getErrorMessage(err))
      setDeletingUser(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="py-4">
      <PageHeader
        title="Người dùng"
        description={`Quản lý tài khoản người dùng hệ thống.${meta ? ` (${meta.total} người dùng)` : ''}`}
        showDecoLine={false}
      >
        <Button variant="primary" size="md" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </PageHeader>

      <ActionErrorBanner error={actionError} onDismiss={() => setActionError(null)} />

      <UserTable
        users={users}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={handleEdit}
        onDelete={setDeletingUser}
      />

      {!isLoading && (
        <Pagination meta={meta} currentPage={page} onPageChange={goToPage} variant="numbered" />
      )}

      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={!!deletingUser}
        message={
          <>
            Bạn có chắc chắn muốn xóa người dùng{' '}
            <span className="font-semibold text-on-surface">{deletingUser?.full_name}</span>?
            Hành động này không thể hoàn tác.
          </>
        }
        confirmLabel="Xóa người dùng"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  )
}
