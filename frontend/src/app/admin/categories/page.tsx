'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataStates } from '@/components/shared/DataStates'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ActionErrorBanner } from '@/components/shared/ActionErrorBanner'
import { FormModal } from '@/components/shared/FormModal'
import { validateMinLength, validateMaxLength, validateFields } from '@/lib/form-validation'
import api from '@/lib/api'
import type { Category, ApiResponse } from '@/types'

// Cac loai danh muc tuong ung voi CategoryType enum trong backend
const CATEGORY_TYPES = [
  { value: 'product', label: 'Sản phẩm' },
  { value: 'project', label: 'Dự án' },
  { value: 'article', label: 'Bài viết' },
  { value: 'material', label: 'Vật liệu' },
] as const

type CategoryType = (typeof CATEGORY_TYPES)[number]['value']

type CategoryFormData = {
  name: string
  description: string
  type: CategoryType
  parent_id: string
  is_active: boolean
}

const EMPTY_FORM: CategoryFormData = {
  name: '',
  description: '',
  type: 'product',
  parent_id: '',
  is_active: true,
}

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<CategoryType>('product')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Delete state
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Action error
  const [actionError, setActionError] = useState<string | null>(null)

  // Fetch categories theo type hien tai
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/categories?type=${activeTab}&limit=200`) as unknown as ApiResponse<Category[]>
      setCategories(res.data || [])
    } catch {
      setError('Không thể tải danh mục.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  // Lay danh sach parent categories cho select (chi cung type, khong phai chinh no)
  const parentOptions = categories.filter((c) => !c.parent_id && c.id !== editingCategory?.id)

  function openCreate() {
    setEditingCategory(null)
    setFormData({ ...EMPTY_FORM, type: activeTab })
    setFormErrors({})
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      description: cat.description || '',
      type: cat.type,
      parent_id: cat.parent_id || '',
      is_active: cat.is_active,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateFields({
      name: [
        !formData.name.trim() ? 'Tên danh mục không được để trống.' : null,
        validateMinLength(formData.name, 2, 'Tên danh mục'),
        validateMaxLength(formData.name, 100, 'Tên danh mục'),
      ],
      description: [validateMaxLength(formData.description, 500, 'Mô tả')],
    })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSaving(true)

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      parent_id: formData.parent_id || undefined,
      is_active: formData.is_active,
    }

    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, payload)
      } else {
        await api.post('/categories', payload)
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu danh mục.'
      setActionError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await api.delete(`/categories/${deleting.id}`)
      setDeleting(null)
      fetchCategories()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa danh mục.'
      setActionError(msg)
      setDeleting(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // Dem so luong theo type
  const typeCounts = CATEGORY_TYPES.map((t) => ({
    ...t,
    // Chi hien count khi dang o tab do (du lieu chi load theo tab)
    active: t.value === activeTab,
  }))

  const inputClass = 'w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary'
  const labelClass = 'mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant'

  // Tach categories thanh parent + children de hien thi co thu bac
  const topLevel = categories.filter((c) => !c.parent_id)
  // Gom children theo parent_id
  const childrenMap = new Map<string, Category[]>()
  categories.forEach((c) => {
    if (c.parent_id) {
      const arr = childrenMap.get(c.parent_id) || []
      arr.push(c)
      childrenMap.set(c.parent_id, arr)
    }
  })
  // Flatten de hien thi — parent truoc, children sau (co indent)
  const flatList: (Category & { _isChild?: boolean })[] = []
  topLevel.forEach((parent) => {
    flatList.push(parent)
    const children = childrenMap.get(parent.id)
    if (children) {
      children.forEach((child) => flatList.push({ ...child, _isChild: true }))
    }
  })

  return (
    <div className="py-4">
      <PageHeader
        title="Quản lý danh mục"
        description={`${categories.length} danh mục ${CATEGORY_TYPES.find((t) => t.value === activeTab)?.label?.toLowerCase()}`}
        showDecoLine={false}
      >
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </PageHeader>

      <ActionErrorBanner error={actionError} onDismiss={() => setActionError(null)} />

      {/* Tabs theo loai danh muc */}
      <div className="mb-6 flex flex-wrap gap-2">
        {typeCounts.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`rounded-xl px-4 py-2.5 min-h-[44px] text-body-sm font-medium transition-all duration-200 ${
              t.active
                ? 'bg-primary text-on-primary shadow-ambient-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataStates
        loading={loading}
        error={error}
        isEmpty={flatList.length === 0}
        onRetry={fetchCategories}
        emptyMessage={`Chưa có danh mục ${CATEGORY_TYPES.find((t) => t.value === activeTab)?.label?.toLowerCase()} nào.`}
        minHeight="min-h-[30vh]"
      >
        <DataTable<Category & { _isChild?: boolean }>
          columns={categoryColumns(openEdit, setDeleting)}
          data={flatList}
          rowKey={(c) => c.id}
        />
      </DataStates>

      {/* Create/Edit Modal */}
      <FormModal
        open={modalOpen}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        loading={saving}
        onSubmit={handleSave}
        onClose={() => setModalOpen(false)}
        submitLabel={editingCategory ? 'Cập nhật' : 'Tạo danh mục'}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tên danh mục *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => { setFormData((f) => ({ ...f, name: e.target.value })); setFormErrors((p) => ({ ...p, name: '' })) }}
              className={`${inputClass} ${formErrors.name ? 'ring-2 ring-error/30' : ''}`}
              placeholder="VD: Gỗ tự nhiên, Phòng khách..."
            />
            {formErrors.name && <p className="mt-1 text-body-sm text-error">{formErrors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => { setFormData((f) => ({ ...f, description: e.target.value })); setFormErrors((p) => ({ ...p, description: '' })) }}
              className={`${inputClass} min-h-[80px] resize-y ${formErrors.description ? 'ring-2 ring-error/30' : ''}`}
              placeholder="Mô tả ngắn về danh mục..."
            />
            {formErrors.description && <p className="mt-1 text-body-sm text-error">{formErrors.description}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Loại danh mục</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value as CategoryType, parent_id: '' }))}
                className={inputClass}
                disabled={!!editingCategory}
              >
                {CATEGORY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {editingCategory && (
                <p className="mt-1 text-body-sm text-on-surface-variant/50">Không thể đổi loại sau khi tạo</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Danh mục cha</label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData((f) => ({ ...f, parent_id: e.target.value }))}
                className={inputClass}
              >
                <option value="">-- Không (cấp cao nhất) --</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              <span className="text-body-md text-on-surface">Đang hoạt động</span>
            </label>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        message={
          <>
            Bạn có chắc chắn muốn xóa danh mục{' '}
            <span className="font-semibold text-on-surface">{deleting?.name}</span>?
            {deleting && childrenMap.has(deleting.id) && (
              <span className="mt-1 block text-body-sm text-warning-text">
                Danh mục này có {childrenMap.get(deleting.id)!.length} danh mục con sẽ bị ảnh hưởng.
              </span>
            )}
          </>
        }
        confirmLabel="Xóa danh mục"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}

// ─── Column Definitions ────────────────────────────────────────

const actionBtnClass = 'flex items-center justify-center rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-on-surface-variant hover:bg-surface-container-high'

function categoryColumns(
  onEdit: (cat: Category) => void,
  onDelete: (cat: Category | null) => void,
): Column<Category & { _isChild?: boolean }>[] {
  return [
    {
      header: 'Danh mục',
      render: (cat) => (
        <div className={cat._isChild ? 'pl-6' : ''}>
          <div className="flex items-center gap-2">
            {cat._isChild && (
              <span className="text-on-surface-variant/30">└</span>
            )}
            <div>
              <p className="text-body-md font-medium text-on-surface">{cat.name}</p>
              <p className="text-body-sm text-on-surface-variant">/{cat.slug}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Mô tả',
      render: (cat) => (
        <span className="line-clamp-2 text-body-sm text-on-surface-variant">
          {cat.description || '-'}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      render: (cat) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 font-label text-label-sm uppercase ${
            cat.is_active
              ? 'bg-success-bg text-success-text'
              : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          {cat.is_active ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      render: (cat) => (
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(cat)} className={actionBtnClass} title="Chỉnh sửa">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(cat)}
            className="flex items-center justify-center rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-error hover:bg-error-container"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]
}
