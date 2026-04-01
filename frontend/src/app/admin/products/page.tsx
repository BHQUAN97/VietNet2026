'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, AlertTriangle, Pencil, Trash2, Eye, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import type { Product, Category, ApiResponse, PaginationMeta } from '@/types'

const MATERIAL_TYPES = [
  'go-tu-nhien',
  'go-cong-nghiep',
  'laminate',
  'acrylic',
  'melamine',
  'veneer',
]

const MATERIAL_LABELS: Record<string, string> = {
  'go-tu-nhien': 'Gỗ tự nhiên',
  'go-cong-nghiep': 'Gỗ công nghiệp',
  laminate: 'Laminate',
  acrylic: 'Acrylic',
  melamine: 'Melamine',
  veneer: 'Veneer',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    material_type: '',
    finish: '',
    price_range: '',
    seo_title: '',
    seo_description: '',
    is_featured: false,
    is_new: false,
  })
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const LIMIT = 20

  const fetchCategories = useCallback(async () => {
    try {
      const res = (await api.get(
        '/categories?type=product&limit=100',
      )) as unknown as ApiResponse<Category[]>
      setCategories(res.data || [])
    } catch {}
  }, [])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT }
      if (statusFilter) params.status = statusFilter
      if (materialFilter) params.material_type = materialFilter
      const res = (await api.get('/products/admin/list', {
        params,
      })) as unknown as ApiResponse<Product[]>
      setProducts(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Không thể tải danh sách sản phẩm.')
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, materialFilter])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  function openCreate() {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      category_id: '',
      material_type: '',
      finish: '',
      price_range: '',
      seo_title: '',
      seo_description: '',
      is_featured: false,
      is_new: false,
    })
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      material_type: product.material_type || '',
      finish: product.finish || '',
      price_range: product.price_range || '',
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      is_featured: product.is_featured,
      is_new: product.is_new,
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        description: formData.description || undefined,
        category_id: formData.category_id || undefined,
        material_type: formData.material_type || undefined,
        finish: formData.finish || undefined,
        price_range: formData.price_range || undefined,
        seo_title: formData.seo_title || undefined,
        seo_description: formData.seo_description || undefined,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
      }

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || 'Không thể lưu sản phẩm.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(product: Product) {
    try {
      await api.patch(`/products/${product.id}/publish`)
      fetchProducts()
    } catch {
      setError('Không thể xuất bản sản phẩm.')
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct) return
    setIsDeleting(true)
    try {
      await api.delete(`/products/${deletingProduct.id}`)
      setDeletingProduct(null)
      fetchProducts()
    } catch {
      setError('Không thể xóa sản phẩm.')
      setDeletingProduct(null)
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
          <h1 className="font-headline text-headline-lg text-on-surface">
            Quản lý sản phẩm
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {meta && <span>{meta.total} sản phẩm</span>}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
          <p className="text-body-sm text-on-error-container">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-body-sm underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Status filter */}
        <div className="flex gap-2">
          {['', 'draft', 'published'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s)
                setPage(1)
              }}
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

        {/* Material filter */}
        <select
          value={materialFilter}
          onChange={(e) => {
            setMaterialFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-xl bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả vật liệu</option>
          {MATERIAL_TYPES.map((m) => (
            <option key={m} value={m}>
              {MATERIAL_LABELS[m] || m}
            </option>
          ))}
        </select>
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
                  Sản phẩm
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Danh mục
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Vật liệu
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Giá
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Trạng thái
                </th>
                <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-body-md text-on-surface-variant"
                  >
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-body-md font-medium text-on-surface">
                          {product.name}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          /{product.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {product.material_type
                        ? MATERIAL_LABELS[product.material_type] ||
                          product.material_type
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                      {product.price_range || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 font-label text-label-sm uppercase ${
                          product.status === 'published'
                            ? 'bg-success-bg text-success-text'
                            : 'bg-warning-bg text-warning-text'
                        }`}
                      >
                        {product.status === 'published'
                          ? 'Xuất bản'
                          : 'Nháp'}
                      </span>
                      {product.is_featured && (
                        <span className="ml-1 inline-flex rounded-full bg-primary-fixed px-2 py-0.5 font-label text-label-sm text-on-primary-fixed">
                          Featured
                        </span>
                      )}
                      {product.is_new && (
                        <span className="ml-1 inline-flex rounded-full bg-tertiary/10 px-2 py-0.5 font-label text-label-sm text-tertiary">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {product.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(product)}
                            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                            title="Xuất bản"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
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
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="px-4 text-body-md text-on-surface-variant">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
          <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8">
            <h3 className="font-headline text-headline-sm text-on-surface">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, description: e.target.value }))
                  }
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
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        category_id: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Vật liệu
                  </label>
                  <select
                    value={formData.material_type}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        material_type: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Chọn vật liệu --</option>
                    {MATERIAL_TYPES.map((m) => (
                      <option key={m} value={m}>
                        {MATERIAL_LABELS[m] || m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Hoàn thiện
                  </label>
                  <input
                    type="text"
                    value={formData.finish}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, finish: e.target.value }))
                    }
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Matt, Bóng, Sơn PU..."
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Khoảng giá
                  </label>
                  <input
                    type="text"
                    value={formData.price_range}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        price_range: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="15-25 triệu"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, seo_title: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        seo_description: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        is_featured: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-body-md text-on-surface">
                    Sản phẩm nổi bật
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        is_new: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-body-md text-on-surface">
                    Sản phẩm mới
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button type="submit" loading={saving}>
                  {editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingProduct && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center bg-on-surface/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8">
            <h3 className="font-headline text-headline-sm text-on-surface">
              Xác nhận xóa
            </h3>
            <p className="mt-3 text-body-md text-on-surface-variant">
              Bạn có chắc chắn muốn xóa sản phẩm{' '}
              <span className="font-semibold text-on-surface">
                {deletingProduct.name}
              </span>
              ?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                loading={isDeleting}
              >
                Xóa sản phẩm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
