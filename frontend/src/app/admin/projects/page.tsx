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
import type { Project } from '@/types'
import { useAdminCrud } from '@/hooks/useAdminCrud'

const CATEGORY_VARIANTS: Record<string, 'primary' | 'secondary' | 'tertiary' | 'neutral'> = {
  residential: 'primary',
  commercial: 'secondary',
  hospitality: 'tertiary',
}

function CategoryBadge({ name }: { name: string }) {
  const key = name.toLowerCase()
  const variant = CATEGORY_VARIANTS[key] || 'neutral'
  return <Badge variant={variant} size="sm">{name}</Badge>
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const crud = useAdminCrud<Project>({
    endpoint: '/projects',
    params: { status: statusFilter, search: searchQuery },
  })

  return (
    <div className="py-4">
      <PageHeader label="Project Library" title="Quản lý dự án" showDecoLine={false}>
        <Button variant="primary" size="md" onClick={() => router.push('/admin/projects/editor')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>

      {/* Search & Filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-surface-container-low py-2.5 pl-10 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <StatusFilterBar
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
          allLabel="All"
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <ActionErrorBanner error={crud.actionError} onDismiss={crud.clearActionError} />

      <DataStates loading={crud.loading} error={crud.error} isEmpty={crud.isEmpty} onRetry={crud.refresh} emptyMessage="Chưa có dự án nào." minHeight="min-h-[30vh]">
        <DataTable<Project>
          columns={projectColumns(crud.handlePublish, (p) => router.push(`/admin/projects/editor?id=${p.id}`), crud.setDeleting)}
          data={crud.items}
          rowKey={(p) => p.id}
          rowClassName="group"
        />
      </DataStates>

      <Pagination meta={crud.meta} currentPage={crud.page} onPageChange={crud.goToPage} variant="numbered" />

      <ConfirmDialog
        open={!!crud.deleting}
        message={<>Bạn có chắc chắn muốn xóa dự án <span className="font-semibold text-on-surface">{crud.deleting?.title}</span>?</>}
        confirmLabel="Xóa dự án"
        loading={crud.isDeleting}
        onConfirm={crud.confirmDelete}
        onCancel={() => crud.setDeleting(null)}
      />
    </div>
  )
}

// ─── Column Definitions ────────────────────────────────────────

const actionBtnClass = 'rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-on-surface-variant hover:bg-surface-container-high'

function projectColumns(
  onPublish: (p: Project) => void,
  onEdit: (p: Project) => void,
  onDelete: (p: Project | null) => void,
): Column<Project>[] {
  return [
    {
      header: 'Project Information',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
            {p.cover_image?.preview_url ? (
              <Image src={p.cover_image.preview_url} alt={p.title} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30"><span className="text-lg">&#9633;</span></div>
            )}
          </div>
          <div>
            <p className="text-body-md font-medium text-on-surface">{p.title}</p>
            <p className="mt-0.5 text-body-sm text-on-surface-variant">REF-{p.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (p) => p.category ? <CategoryBadge name={p.category.name} /> : <span className="text-body-sm text-on-surface-variant">-</span>,
    },
    {
      header: 'Date Created',
      render: (p) => <span className="text-body-sm text-on-surface-variant">{formatDate(p.created_at)}</span>,
    },
    {
      header: 'Status',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
          {p.status === 'draft' && (
            <button onClick={() => onPublish(p)} className={actionBtnClass} title="Xuất bản"><Eye className="h-4 w-4" /></button>
          )}
          <button onClick={() => onEdit(p)} className={actionBtnClass} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => onDelete(p)} className="rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-error hover:bg-error-container" title="Xóa"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ]
}
