'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, AlertTriangle, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import type { Project, Category, ApiResponse, PaginationMeta } from '@/types'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    style: '',
    area: '',
    location: '',
    duration: '',
    year_completed: '',
    seo_title: '',
    seo_description: '',
    is_featured: false,
  })
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const LIMIT = 20

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories?type=project&limit=100') as unknown as ApiResponse<Category[]>
      setCategories(res.data || [])
    } catch {}
  }, [])

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT }
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/projects/admin/list', { params }) as unknown as ApiResponse<Project[]>
      setProjects(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Không thể tải danh sách dự án.')
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  function openCreate() {
    setEditingProject(null)
    setFormData({
      title: '', description: '', content: '', category_id: '',
      style: '', area: '', location: '', duration: '',
      year_completed: '', seo_title: '', seo_description: '', is_featured: false,
    })
    setModalOpen(true)
  }

  function openEdit(project: Project) {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description || '',
      content: project.content || '',
      category_id: project.category_id || '',
      style: project.style || '',
      area: project.area || '',
      location: project.location || '',
      duration: project.duration || '',
      year_completed: project.year_completed?.toString() || '',
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || '',
      is_featured: project.is_featured,
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || undefined,
        content: formData.content || undefined,
        category_id: formData.category_id || undefined,
        style: formData.style || undefined,
        area: formData.area || undefined,
        location: formData.location || undefined,
        duration: formData.duration || undefined,
        year_completed: formData.year_completed ? parseInt(formData.year_completed) : undefined,
        seo_title: formData.seo_title || undefined,
        seo_description: formData.seo_description || undefined,
        is_featured: formData.is_featured,
      }

      if (editingProject) {
        await api.patch(`/projects/${editingProject.id}`, payload)
      } else {
        await api.post('/projects', payload)
      }
      setModalOpen(false)
      fetchProjects()
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || 'Không thể lưu dự án.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(project: Project) {
    try {
      await api.patch(`/projects/${project.id}/publish`)
      fetchProjects()
    } catch {
      setError('Không thể xuất bản dự án.')
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingProject) return
    setIsDeleting(true)
    try {
      await api.delete(`/projects/${deletingProject.id}`)
      setDeletingProject(null)
      fetchProjects()
    } catch {
      setError('Không thể xóa dự án.')
      setDeletingProject(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = meta?.totalPages || 1

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">Quản lý dự án</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {meta && <span>{meta.total} dự án</span>}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm dự án
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
          <p className="text-body-sm text-on-error-container">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-body-sm underline">
            Đóng
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['', 'draft', 'published'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`rounded-full px-4 py-2 text-body-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {s === '' ? 'Tất cả' : s === 'draft' ? 'Nháp' : 'Đã xuất bản'}
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
                  Tiêu đề
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Danh mục
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Trạng thái
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Lượt xem
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-body-md text-on-surface-variant">
                    Chưa có dự án nào.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="transition-colors hover:bg-surface-container-low/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-body-md font-medium text-on-surface">{project.title}</p>
                        <p className="text-body-sm text-on-surface-variant">/{project.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {project.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 font-label text-label-sm uppercase ${
                          project.status === 'published'
                            ? 'bg-success-bg text-success-text'
                            : 'bg-warning-bg text-warning-text'
                        }`}
                      >
                        {project.status === 'published' ? 'Xuất bản' : 'Nháp'}
                      </span>
                      {project.is_featured && (
                        <span className="ml-1 inline-flex rounded-full bg-primary-fixed px-2 py-0.5 font-label text-label-sm text-on-primary-fixed">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {project.view_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {project.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(project)}
                            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                            title="Xuất bản"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(project)}
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProject(project)}
                          className="rounded-lg p-2 text-error hover:bg-error-container"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
            Trước
          </Button>
          <span className="px-4 text-body-md text-on-surface-variant">
            {page} / {totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
          <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8">
            <h3 className="font-headline text-headline-sm text-on-surface">
              {editingProject ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
            </h3>
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Danh mục
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Phong cách
                  </label>
                  <input
                    type="text"
                    value={formData.style}
                    onChange={(e) => setFormData(f => ({ ...f, style: e.target.value }))}
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Modern, Classic, Minimalist..."
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Diện tích
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData(f => ({ ...f, area: e.target.value }))}
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="120m2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Năm
                  </label>
                  <input
                    type="number"
                    value={formData.year_completed}
                    onChange={(e) => setFormData(f => ({ ...f, year_completed: e.target.value }))}
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="2025"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                  className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(f => ({ ...f, seo_title: e.target.value }))}
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    SEO Description
                  </label>
                  <input
                    type="text"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(f => ({ ...f, seo_description: e.target.value }))}
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(f => ({ ...f, is_featured: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                <span className="text-body-md text-on-surface">Dự án nổi bật (hiển thị trang chủ)</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)} disabled={saving}>
                  Hủy
                </Button>
                <Button type="submit" loading={saving}>
                  {editingProject ? 'Cập nhật' : 'Tạo dự án'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingProject && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8">
            <h3 className="font-headline text-headline-sm text-on-surface">Xác nhận xóa</h3>
            <p className="mt-3 text-body-md text-on-surface-variant">
              Bạn có chắc chắn muốn xóa dự án{' '}
              <span className="font-semibold text-on-surface">{deletingProject.title}</span>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeletingProject(null)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm} loading={isDeleting}>
                Xóa dự án
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
