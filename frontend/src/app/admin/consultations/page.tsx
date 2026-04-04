'use client'

import { useState } from 'react'
import { Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusFilterBar } from '@/components/shared/StatusFilterBar'
import { DataStates } from '@/components/shared/DataStates'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ActionErrorBanner } from '@/components/shared/ActionErrorBanner'
import { FormModal } from '@/components/shared/FormModal'
import { formatDate } from '@/lib/date'
import { getErrorMessage } from '@/lib/error'
import api from '@/lib/api'
import type { Consultation } from '@/types'
import { CONSULTATION_STATUS } from '@/lib/status-config'
import { useAdminList } from '@/hooks/useAdminList'

export default function AdminConsultationsPage() {
  const [statusFilter, setStatusFilter] = useState('')

  const {
    items: consultations, meta, page, loading: isLoading, error,
    goToPage, refresh, isEmpty,
  } = useAdminList<Consultation>({
    endpoint: '/consultations',
    params: { status: statusFilter },
  })

  // Detail/Notes modal
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [notes, setNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  function openDetail(consultation: Consultation) {
    setSelectedConsultation(consultation)
    setNotes(consultation.notes || '')
    setNewStatus(consultation.status)
  }

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedConsultation) return
    // Validate notes max length
    if (notes.length > 2000) {
      setActionError('Ghi chú không được vượt quá 2000 ký tự.')
      return
    }
    setSaving(true)
    try {
      await api.patch(`/consultations/${selectedConsultation.id}`, {
        status: newStatus,
        notes: notes || undefined,
      })
      setSelectedConsultation(null)
      refresh()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-4">
      <PageHeader
        title="Quản lý tư vấn"
        description={`Quản lý các yêu cầu tư vấn từ khách hàng.${meta ? ` (${meta.total} yêu cầu)` : ''}`}
        showDecoLine={false}
      />

      <ActionErrorBanner error={actionError} onDismiss={() => setActionError(null)} />

      <StatusFilterBar
        options={[
          { value: 'new', label: 'Mới' },
          { value: 'contacted', label: 'Đã liên hệ' },
          { value: 'scheduled', label: 'Đã hẹn' },
          { value: 'completed', label: 'Hoàn thành' },
          { value: 'cancelled', label: 'Đã hủy' },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
        className="mb-6"
      />

      <DataStates loading={isLoading} error={error} isEmpty={isEmpty} onRetry={refresh} emptyMessage="Chưa có yêu cầu tư vấn nào." minHeight="min-h-[30vh]">
        <DataTable<Consultation>
          columns={consultationColumns(openDetail)}
          data={consultations}
          rowKey={(c) => c.id}
        />
      </DataStates>

      <Pagination meta={meta} currentPage={page} onPageChange={goToPage} variant="numbered" />

      {/* Detail / Status Update — dung FormModal base */}
      <FormModal
        open={!!selectedConsultation}
        title="Chi tiết tư vấn"
        subtitle=""
        loading={saving}
        maxWidth="max-w-lg"
        onSubmit={handleUpdateStatus}
        onClose={() => setSelectedConsultation(null)}
        submitLabel="Cập nhật"
      >
        {selectedConsultation && (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-body-md font-medium text-on-surface">{selectedConsultation.name}</p>
              <div className="mt-2 space-y-1 text-body-sm text-on-surface-variant">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {selectedConsultation.email}</p>
                {selectedConsultation.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {selectedConsultation.phone}</p>}
                {selectedConsultation.project_type && <p>Loại: {selectedConsultation.project_type}</p>}
                {selectedConsultation.area && <p>Diện tích: {selectedConsultation.area}</p>}
                {selectedConsultation.budget_range && <p>Ngân sách: {selectedConsultation.budget_range}</p>}
                {selectedConsultation.source && <p>Nguồn: {selectedConsultation.source}</p>}
              </div>
            </div>

            {selectedConsultation.message && (
              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">Tin nhắn</label>
                <p className="rounded-xl bg-surface-container-low p-4 text-body-md text-on-surface">{selectedConsultation.message}</p>
              </div>
            )}

            <div>
              <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">Trạng thái</label>
              <div className="relative">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-surface-container px-4 py-3 pr-10 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                  {Object.entries(CONSULTATION_STATUS).map(([value, cfg]) => (
                    <option key={value} value={value}>{cfg.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">Ghi chú nội bộ</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000}
                className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ghi chú cho nội bộ..." />
              <p className="mt-1 text-right text-body-sm text-on-surface-variant">{notes.length}/2000</p>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}

// ─── Column Definitions ────────────────────────────────────────

function consultationColumns(onDetail: (c: Consultation) => void): Column<Consultation>[] {
  return [
    {
      header: 'Khách hàng',
      render: (c) => (
        <div>
          <p className="text-body-md font-medium text-on-surface">{c.name}</p>
          {c.message && <p className="mt-0.5 line-clamp-1 text-body-sm text-on-surface-variant">{c.message}</p>}
        </div>
      ),
    },
    {
      header: 'Liên hệ',
      render: (c) => (
        <div className="flex flex-col gap-0.5 text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
          {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
        </div>
      ),
    },
    {
      header: 'Loại',
      render: (c) => <span className="text-body-sm text-on-surface-variant">{c.project_type || '-'}</span>,
    },
    {
      header: 'Trạng thái',
      render: (c) => (
        <Badge variant={CONSULTATION_STATUS[c.status]?.variant} dot={CONSULTATION_STATUS[c.status]?.dot}>
          {CONSULTATION_STATUS[c.status]?.label || c.status}
        </Badge>
      ),
    },
    {
      header: 'Ngày gửi',
      render: (c) => <span className="text-body-sm text-on-surface-variant">{formatDate(c.created_at)}</span>,
    },
    {
      header: 'Thao tác',
      render: (c) => (
        <button onClick={() => onDetail(c)} className="rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-on-surface-variant hover:bg-surface-container-high" title="Chi tiết">
          <MessageSquare className="h-4 w-4" />
        </button>
      ),
    },
  ]
}
