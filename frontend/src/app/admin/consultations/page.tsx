'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import type { Consultation, ApiResponse, PaginationMeta } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  new: 'Moi',
  contacted: 'Da lien he',
  scheduled: 'Da hen',
  completed: 'Hoan thanh',
  cancelled: 'Da huy',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-primary-fixed text-on-primary-fixed',
  contacted: 'bg-warning-bg text-warning-text',
  scheduled: 'bg-tertiary-container text-on-tertiary-container',
  completed: 'bg-success-bg text-success-text',
  cancelled: 'bg-surface-container text-on-surface-variant',
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detail/Notes modal
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [notes, setNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const LIMIT = 20

  const fetchConsultations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT }
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/consultations', { params }) as unknown as ApiResponse<Consultation[]>
      setConsultations(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Khong the tai danh sach tu van.')
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchConsultations()
  }, [fetchConsultations])

  function openDetail(consultation: Consultation) {
    setSelectedConsultation(consultation)
    setNotes(consultation.notes || '')
    setNewStatus(consultation.status)
  }

  async function handleUpdateStatus() {
    if (!selectedConsultation) return
    setSaving(true)
    try {
      await api.patch(`/consultations/${selectedConsultation.id}`, {
        status: newStatus,
        notes: notes || undefined,
      })
      setSelectedConsultation(null)
      fetchConsultations()
    } catch {
      setError('Khong the cap nhat trang thai.')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = meta?.totalPages || 1

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline text-headline-lg text-on-surface">Quan ly tu van</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Quan ly cac yeu cau tu van tu khach hang.
          {meta && <span className="ml-1 text-body-sm">({meta.total} yeu cau)</span>}
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
          <p className="text-body-sm text-on-error-container">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-body-sm underline">
            Dong
          </button>
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['', 'new', 'contacted', 'scheduled', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`rounded-full px-4 py-2 text-body-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {s === '' ? 'Tat ca' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Khach hang
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Lien he
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Loai
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Trang thai
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Ngay gui
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Thao tac
                </th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-body-md text-on-surface-variant">
                    Chua co yeu cau tu van nao.
                  </td>
                </tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-container-low/50">
                    <td className="px-4 py-3">
                      <p className="text-body-md font-medium text-on-surface">{c.name}</p>
                      {c.message && (
                        <p className="mt-0.5 line-clamp-1 text-body-sm text-on-surface-variant">
                          {c.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-body-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </span>
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {c.project_type || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 font-label text-label-sm uppercase ${STATUS_COLORS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {new Date(c.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(c)}
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                        title="Chi tiet"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Truoc
          </Button>
          <span className="px-4 text-body-md text-on-surface-variant">
            {page} / {totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      {/* Detail / Status Update Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
          <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8">
            <h3 className="font-headline text-headline-sm text-on-surface">
              Chi tiet tu van
            </h3>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-body-md font-medium text-on-surface">
                  {selectedConsultation.name}
                </p>
                <div className="mt-2 space-y-1 text-body-sm text-on-surface-variant">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {selectedConsultation.email}
                  </p>
                  {selectedConsultation.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> {selectedConsultation.phone}
                    </p>
                  )}
                  {selectedConsultation.project_type && (
                    <p>Loai: {selectedConsultation.project_type}</p>
                  )}
                  {selectedConsultation.area && (
                    <p>Dien tich: {selectedConsultation.area}</p>
                  )}
                  {selectedConsultation.budget_range && (
                    <p>Ngan sach: {selectedConsultation.budget_range}</p>
                  )}
                  {selectedConsultation.source && (
                    <p>Nguon: {selectedConsultation.source}</p>
                  )}
                </div>
              </div>

              {selectedConsultation.message && (
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Tin nhan
                  </label>
                  <p className="rounded-xl bg-surface-container-low p-4 text-body-md text-on-surface">
                    {selectedConsultation.message}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Trang thai
                </label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full appearance-none rounded-xl bg-surface-container px-4 py-3 pr-10 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Ghi chu noi bo
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ghi chu cho noi bo..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setSelectedConsultation(null)} disabled={saving}>
                Dong
              </Button>
              <Button onClick={handleUpdateStatus} loading={saving}>
                Cap nhat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
