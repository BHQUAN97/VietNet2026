'use client'

import { User } from '@/types'
import { Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { USER_ROLE, USER_STATUS } from '@/lib/status-config'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 w-full animate-pulse rounded-full bg-surface-container-high" />
        </td>
      ))}
    </tr>
  )
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return '--'
  }
}

export function UserTable({
  users,
  isLoading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
}: UserTableProps) {
  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl bg-surface-container-low py-3 pl-10 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all duration-300 focus:bg-surface-container focus:ring-2 focus:ring-primary/20 min-h-[44px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-surface-container-low">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container">
              <th className="px-4 py-3 font-label text-label-lg tracking-label-wide text-on-surface-variant">
                Họ tên
              </th>
              <th className="px-4 py-3 font-label text-label-lg tracking-label-wide text-on-surface-variant">
                Email
              </th>
              <th className="px-4 py-3 font-label text-label-lg tracking-label-wide text-on-surface-variant">
                Vai trò
              </th>
              <th className="px-4 py-3 font-label text-label-lg tracking-label-wide text-on-surface-variant">
                Trạng thái
              </th>
              <th className="px-4 py-3 font-label text-label-lg tracking-label-wide text-on-surface-variant">
                Đăng nhập cuối
              </th>
              <th className="px-4 py-3 font-label text-label-lg tracking-label-wide text-on-surface-variant">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-body-md text-on-surface-variant">
                    {searchQuery
                      ? 'Không tìm thấy người dùng phù hợp.'
                      : 'Chưa có người dùng nào.'}
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors duration-200 hover:bg-surface-container/50"
                >
                  <td className="px-4 py-4">
                    <p className="text-body-md font-medium text-on-surface">
                      {user.full_name}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-body-sm text-on-surface-variant">{user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={USER_ROLE[user.role]?.variant}
                      size="md"
                    >
                      {USER_ROLE[user.role]?.label || user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={USER_STATUS[user.status]?.variant}
                      dot={USER_STATUS[user.status]?.dot}
                      size="md"
                    >
                      {USER_STATUS[user.status]?.label || user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-body-sm text-on-surface-variant">
                      {formatDate(user.last_login_at)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                        aria-label={`Sửa ${user.full_name}`}
                        className="h-10 w-10 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user)}
                        aria-label={`Xóa ${user.full_name}`}
                        className="h-10 w-10 p-0 text-error hover:bg-error-container/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
