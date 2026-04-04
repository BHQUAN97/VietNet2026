'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusFilterBar } from '@/components/shared/StatusFilterBar'
import { DataStates } from '@/components/shared/DataStates'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ActionErrorBanner } from '@/components/shared/ActionErrorBanner'
import { formatDate } from '@/lib/date'
import type { Article } from '@/types'
import { useAdminCrud } from '@/hooks/useAdminCrud'

export default function AdminArticlesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const crud = useAdminCrud<Article>({
    endpoint: '/articles',
    params: { status: statusFilter, search: searchQuery },
  })

  return (
    <div className="py-4">
      <PageHeader label="Content" title="Quản lý bài viết" showDecoLine={false}>
        <Button variant="primary" size="md" onClick={() => router.push('/admin/articles/editor')}>
          <Plus className="mr-2 h-4 w-4" />
          Bài viết mới
        </Button>
      </PageHeader>

      {/* Search & Filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-surface-container-low py-2.5 pl-10 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <StatusFilterBar
          options={[
            { value: 'draft', label: 'Nháp' },
            { value: 'published', label: 'Đã xuất bản' },
          ]}
          allLabel="Tất cả"
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <ActionErrorBanner error={crud.actionError} onDismiss={crud.clearActionError} />

      <DataStates loading={crud.loading} error={crud.error} isEmpty={crud.isEmpty} onRetry={crud.refresh} emptyMessage="Chưa có bài viết nào." minHeight="min-h-[30vh]">
        <DataTable<Article>
          columns={articleColumns(crud.handlePublish, (a) => router.push(`/admin/articles/editor?id=${a.id}`), crud.setDeleting)}
          data={crud.items}
          rowKey={(a) => a.id}
          rowClassName="group"
        />
      </DataStates>

      <Pagination meta={crud.meta} currentPage={crud.page} onPageChange={crud.goToPage} variant="numbered" />

      <ConfirmDialog
        open={!!crud.deleting}
        message={<>Bạn có chắc chắn muốn xóa bài viết <span className="font-semibold text-on-surface">{crud.deleting?.title}</span>?</>}
        confirmLabel="Xóa bài viết"
        loading={crud.isDeleting}
        onConfirm={crud.confirmDelete}
        onCancel={() => crud.setDeleting(null)}
      />
    </div>
  )
}

// ─── Column Definitions ────────────────────────────────────────

const actionBtnClass = 'rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-on-surface-variant hover:bg-surface-container-high'

function articleColumns(
  onPublish: (a: Article) => void,
  onEdit: (a: Article) => void,
  onDelete: (a: Article | null) => void,
): Column<Article>[] {
  return [
    {
      header: 'Bài viết',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
            {a.cover_image?.preview_url ? (
              <Image src={a.cover_image.preview_url} alt={a.title} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30"><span className="text-lg">&#9633;</span></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-body-md font-medium text-on-surface">{a.title}</p>
            {a.excerpt && <p className="mt-0.5 truncate text-body-sm text-on-surface-variant">{a.excerpt}</p>}
          </div>
        </div>
      ),
    },
    {
      header: 'Danh mục',
      headerClassName: 'hidden md:table-cell',
      className: 'hidden md:table-cell',
      render: (a) => a.category ? <Badge variant="neutral" size="sm">{a.category.name}</Badge> : <span className="text-body-sm text-on-surface-variant">-</span>,
    },
    {
      header: 'Lượt xem',
      headerClassName: 'hidden lg:table-cell text-center',
      className: 'hidden lg:table-cell text-center',
      render: (a) => <span className="text-body-sm text-on-surface-variant">{a.view_count.toLocaleString()}</span>,
    },
    {
      header: 'Ngày tạo',
      headerClassName: 'hidden lg:table-cell',
      className: 'hidden lg:table-cell',
      render: (a) => <span className="text-body-sm text-on-surface-variant">{formatDate(a.created_at)}</span>,
    },
    {
      header: 'Trạng thái',
      headerClassName: 'hidden sm:table-cell text-center',
      className: 'hidden sm:table-cell text-center',
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      header: '',
      render: (a) => (
        <div className="flex items-center gap-1">
          {a.status === 'draft' && (
            <button onClick={() => onPublish(a)} className={actionBtnClass} title="Xuất bản"><Eye className="h-4 w-4" /></button>
          )}
          <button onClick={() => onEdit(a)} className={actionBtnClass} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => onDelete(a)} className="rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-error hover:bg-error-container" title="Xóa"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ]
}
