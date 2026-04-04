'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusFilterBar } from '@/components/shared/StatusFilterBar'
import { DataStates } from '@/components/shared/DataStates'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ActionErrorBanner } from '@/components/shared/ActionErrorBanner'
import { FormModal } from '@/components/shared/FormModal'
import api from '@/lib/api'
import { GalleryEditor, apiGalleryToImages, imagesToMediaIds, type GalleryImage } from '@/components/admin/GalleryEditor'
import { validateMinLength, validateMaxLength, validateFields } from '@/lib/form-validation'
import type { Product, Category, ApiResponse } from '@/types'
import { useAdminCrud } from '@/hooks/useAdminCrud'

// Material types - fetch dong tu categories type='material'
// Fallback neu chua co categories

type ProductFormData = {
  name: string; description: string; category_id: string; material_type: string
  finish: string; price_range: string; seo_title: string; seo_description: string
  is_featured: boolean; is_new: boolean
}

const EMPTY_FORM: ProductFormData = {
  name: '', description: '', category_id: '', material_type: '',
  finish: '', price_range: '', seo_title: '', seo_description: '',
  is_featured: false, is_new: false,
}

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [materials, setMaterials] = useState<Category[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const crud = useAdminCrud<Product>({
    endpoint: '/products',
    params: { status: statusFilter, material_type: materialFilter },
  })

  // Fetch categories + materials
  const fetchCategories = useCallback(async () => {
    try {
      const [catRes, matRes] = await Promise.all([
        api.get('/categories?type=product&limit=100') as unknown as Promise<ApiResponse<Category[]>>,
        api.get('/categories?type=material&limit=100') as unknown as Promise<ApiResponse<Category[]>>,
      ])
      setCategories(catRes.data || [])
      setMaterials(matRes.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  function openCreate() {
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
    setGalleryImages([])
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setFormData({
      name: product.name, description: product.description || '',
      category_id: product.category_id || '', material_type: product.material_type || '',
      finish: product.finish || '', price_range: product.price_range || '',
      seo_title: product.seo_title || '', seo_description: product.seo_description || '',
      is_featured: product.is_featured, is_new: product.is_new,
    })
    // Load gallery images tu product
    setGalleryImages(apiGalleryToImages((product as any).images || []))
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // Validate truoc khi luu
    const errors = validateFields({
      name: [
        !formData.name.trim() ? 'Tên sản phẩm không được để trống.' : null,
        validateMinLength(formData.name, 2, 'Tên sản phẩm'),
        validateMaxLength(formData.name, 200, 'Tên sản phẩm'),
      ],
      price_range: [validateMaxLength(formData.price_range, 100, 'Khoảng giá')],
      finish: [validateMaxLength(formData.finish, 100, 'Hoàn thiện')],
      seo_title: [validateMaxLength(formData.seo_title, 70, 'SEO Title')],
      seo_description: [validateMaxLength(formData.seo_description, 160, 'SEO Description')],
    })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSaving(true)
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

    try {
      let productId = editingProduct?.id
      if (productId) {
        await api.patch(`/products/${productId}`, payload)
      } else {
        const res = await api.post('/products', payload) as any
        productId = res.data?.id
      }
      // Luu gallery images
      if (productId) {
        const imageIds = imagesToMediaIds(galleryImages)
        await api.patch(`/products/${productId}/images`, { image_ids: imageIds }).catch(() => {})
      }
      crud.refresh()
      setModalOpen(false)
    } catch {
      // silent — UI hiện lỗi qua crud
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
  const labelClass = 'mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant'

  return (
    <div className="py-4">
      <PageHeader title="Quản lý sản phẩm" description={crud.meta ? `${crud.meta.total} sản phẩm` : undefined} showDecoLine={false}>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </PageHeader>

      <ActionErrorBanner error={crud.actionError} onDismiss={crud.clearActionError} />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <StatusFilterBar options={[{ value: 'draft', label: 'Nháp' }, { value: 'published', label: 'Đã xuất bản' }]} value={statusFilter} onChange={setStatusFilter} />
        {materials.length > 0 && (
          <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-xl bg-surface-container px-3 py-2.5 min-h-[44px] text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Tất cả vật liệu</option>
            {materials.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
        )}
      </div>

      <DataStates loading={crud.loading} error={crud.error} isEmpty={crud.isEmpty} onRetry={crud.refresh} emptyMessage="Chưa có sản phẩm nào." minHeight="min-h-[30vh]">
        <DataTable<Product>
          columns={productColumns(crud.handlePublish, openEdit, crud.setDeleting)}
          data={crud.items}
          rowKey={(p) => p.id}
        />
      </DataStates>

      <Pagination meta={crud.meta} currentPage={crud.page} onPageChange={crud.goToPage} variant="numbered" />

      {/* Create/Edit Modal — dung FormModal base */}
      <FormModal
        open={modalOpen}
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        loading={saving}
        onSubmit={handleSave}
        onClose={() => setModalOpen(false)}
        submitLabel={editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tên sản phẩm *</label>
            <input type="text" required value={formData.name} onChange={(e) => { setFormData(f => ({ ...f, name: e.target.value })); setFormErrors(p => ({ ...p, name: '' })) }} className={`${inputClass} ${formErrors.name ? 'ring-2 ring-error/30' : ''}`} />
            {formErrors.name && <p className="mt-1 text-body-sm text-error">{formErrors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Mô tả</label>
            <RichTextEditor content={formData.description} onChange={(html) => setFormData(f => ({ ...f, description: html }))} placeholder="Mô tả sản phẩm..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Danh mục</label>
              <select value={formData.category_id} onChange={(e) => setFormData(f => ({ ...f, category_id: e.target.value }))} className={inputClass}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Vật liệu</label>
              <select value={formData.material_type} onChange={(e) => setFormData(f => ({ ...f, material_type: e.target.value }))} className={inputClass}>
                <option value="">-- Chọn vật liệu --</option>
                {materials.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
              </select>
              <p className="mt-1 text-body-sm text-on-surface-variant/50">Quản lý vật liệu tại Danh mục → type: material</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Hoàn thiện</label>
              <input type="text" value={formData.finish} onChange={(e) => { setFormData(f => ({ ...f, finish: e.target.value })); setFormErrors(p => ({ ...p, finish: '' })) }} className={`${inputClass} ${formErrors.finish ? 'ring-2 ring-error/30' : ''}`} placeholder="Matt, Bóng, Sơn PU..." />
              {formErrors.finish && <p className="mt-1 text-body-sm text-error">{formErrors.finish}</p>}
            </div>
            <div>
              <label className={labelClass}>Khoảng giá</label>
              <input type="text" value={formData.price_range} onChange={(e) => { setFormData(f => ({ ...f, price_range: e.target.value })); setFormErrors(p => ({ ...p, price_range: '' })) }} className={`${inputClass} ${formErrors.price_range ? 'ring-2 ring-error/30' : ''}`} placeholder="15-25 triệu" />
              {formErrors.price_range && <p className="mt-1 text-body-sm text-error">{formErrors.price_range}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>SEO Title <span className="normal-case tracking-normal font-normal text-on-surface-variant/50">({formData.seo_title.length}/70)</span></label>
              <input type="text" value={formData.seo_title} onChange={(e) => { setFormData(f => ({ ...f, seo_title: e.target.value })); setFormErrors(p => ({ ...p, seo_title: '' })) }} className={`${inputClass} ${formErrors.seo_title ? 'ring-2 ring-error/30' : ''}`} />
              {formErrors.seo_title && <p className="mt-1 text-body-sm text-error">{formErrors.seo_title}</p>}
            </div>
            <div>
              <label className={labelClass}>SEO Description <span className="normal-case tracking-normal font-normal text-on-surface-variant/50">({formData.seo_description.length}/160)</span></label>
              <input type="text" value={formData.seo_description} onChange={(e) => { setFormData(f => ({ ...f, seo_description: e.target.value })); setFormErrors(p => ({ ...p, seo_description: '' })) }} className={`${inputClass} ${formErrors.seo_description ? 'ring-2 ring-error/30' : ''}`} />
              {formErrors.seo_description && <p className="mt-1 text-body-sm text-error">{formErrors.seo_description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData(f => ({ ...f, is_featured: e.target.checked }))} className="h-4 w-4 rounded" />
              <span className="text-body-md text-on-surface">Sản phẩm nổi bật</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_new} onChange={(e) => setFormData(f => ({ ...f, is_new: e.target.checked }))} className="h-4 w-4 rounded" />
              <span className="text-body-md text-on-surface">Sản phẩm mới</span>
            </label>
          </div>

          {/* Gallery Images */}
          <div className="rounded-xl bg-surface-container-low p-4">
            <GalleryEditor
              images={galleryImages}
              onChange={setGalleryImages}
              maxImages={20}
            />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!crud.deleting}
        message={<>Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-on-surface">{crud.deleting?.name}</span>?</>}
        confirmLabel="Xóa sản phẩm"
        loading={crud.isDeleting}
        onConfirm={crud.confirmDelete}
        onCancel={() => crud.setDeleting(null)}
      />
    </div>
  )
}

// ─── Column Definitions ────────────────────────────────────────

const actionBtnClass = 'rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-on-surface-variant hover:bg-surface-container-high'

function productColumns(
  onPublish: (p: Product) => void,
  onEdit: (p: Product) => void,
  onDelete: (p: Product | null) => void,
): Column<Product>[] {
  return [
    {
      header: 'Sản phẩm',
      render: (p) => (
        <div>
          <p className="text-body-md font-medium text-on-surface">{p.name}</p>
          <p className="text-body-sm text-on-surface-variant">/{p.slug}</p>
        </div>
      ),
    },
    {
      header: 'Danh mục',
      render: (p) => <span className="text-body-sm text-on-surface-variant">{p.category?.name || '-'}</span>,
    },
    {
      header: 'Vật liệu',
      render: (p) => <span className="text-body-sm text-on-surface-variant">{p.material_type || '-'}</span>,
    },
    {
      header: 'Giá',
      render: (p) => <span className="text-body-sm text-on-surface-variant">{p.price_range || '-'}</span>,
    },
    {
      header: 'Trạng thái',
      render: (p) => (
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 font-label text-label-sm uppercase ${p.status === 'published' ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
            {p.status === 'published' ? 'Xuất bản' : 'Nháp'}
          </span>
          {p.is_featured && <span className="ml-1 inline-flex rounded-full bg-primary-fixed px-2 py-0.5 font-label text-label-sm text-on-primary-fixed">Featured</span>}
          {p.is_new && <span className="ml-1 inline-flex rounded-full bg-tertiary/10 px-2 py-0.5 font-label text-label-sm text-tertiary">New</span>}
        </div>
      ),
    },
    {
      header: 'Thao tác',
      render: (p) => (
        <div className="flex items-center gap-1">
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
