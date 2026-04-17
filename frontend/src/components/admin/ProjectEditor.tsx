'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, Eye, Upload, X, ImageIcon,
  PanelRightClose, PanelRightOpen, Monitor, Smartphone,
  Loader2, Check, AlertCircle, Maximize2, Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import BlockEditor, { type BlockEditorRef } from '@/components/admin/BlockEditor'
import api from '@/lib/api'
import { fileToBase64, uploadMedia, validateImageFile } from '@/lib/media'
import { sanitizeHtml } from '@/lib/sanitize'
import { GalleryEditor, apiGalleryToImages, imagesToMediaIds, type GalleryImage } from '@/components/admin/GalleryEditor'
import { validateMinLength, validateMaxLength, validateFields } from '@/lib/form-validation'
import type { Project, Category, ApiResponse } from '@/types'

/* ================================================================
   COVER IMAGE UPLOAD
   ================================================================ */

function CoverImageUpload({
  imageUrl,
  onUpload,
  onRemove,
}: {
  imageUrl: string | null
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all ${
        imageUrl ? 'aspect-[21/9]' : 'aspect-[21/9] border-2 border-dashed'
      } ${dragging ? 'border-primary bg-primary/5' : 'border-on-surface/15 bg-surface-container-low'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file?.type.startsWith('image/')) onUpload(file)
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }} />

      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent opacity-0 transition-opacity hover:opacity-100">
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-surface/90 px-3 py-2 text-body-sm font-medium text-on-surface shadow-lg backdrop-blur-sm hover:bg-surface">
                <Upload className="h-3.5 w-3.5" /> Thay đổi
              </button>
              <button type="button" onClick={onRemove}
                className="flex items-center gap-1.5 rounded-lg bg-error/90 px-3 py-2 text-body-sm font-medium text-on-error shadow-lg hover:bg-error">
                <X className="h-3.5 w-3.5" /> Xóa
              </button>
            </div>
          </div>
        </>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-3 text-on-surface-variant/50 transition-colors hover:text-on-surface-variant">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-body-md font-medium">Thêm ảnh bìa</p>
            <p className="mt-0.5 text-body-sm">Kéo thả ảnh hoặc click để chọn &middot; Tỷ lệ 21:9</p>
          </div>
        </button>
      )}
    </div>
  )
}

/* ================================================================
   SETTINGS SIDEBAR
   ================================================================ */

function EditorSidebar({
  formData,
  setFormData,
  categories,
  status,
  galleryImages,
  onGalleryChange,
}: {
  formData: ProjectFormData
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>
  categories: Category[]
  status: 'draft' | 'published'
  galleryImages: GalleryImage[]
  onGalleryChange: (images: GalleryImage[]) => void
}) {
  const inputClass = 'w-full rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30'
  const labelClass = 'mb-1 block text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/70'

  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="rounded-xl bg-surface-container-low p-4">
        <p className={labelClass}>Trạng thái</p>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-body-sm font-medium ${
          status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        }`}>
          <div className={`h-2 w-2 rounded-full ${status === 'published' ? 'bg-success' : 'bg-warning'}`} />
          {status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </div>
      </div>

      {/* Category & Style */}
      <div>
        <label className={labelClass}>Danh mục</label>
        <select value={formData.category_id} onChange={(e) => setFormData(f => ({ ...f, category_id: e.target.value }))}
          className={inputClass}>
          <option value="">-- Chọn --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Phong cách</label>
        <input type="text" value={formData.style} placeholder="Modern, Classic..."
          onChange={(e) => setFormData(f => ({ ...f, style: e.target.value }))} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Diện tích</label>
          <input type="text" value={formData.area} placeholder="120m²"
            onChange={(e) => setFormData(f => ({ ...f, area: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Năm</label>
          <input type="number" value={formData.year_completed} placeholder="2025"
            onChange={(e) => setFormData(f => ({ ...f, year_completed: e.target.value }))} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Địa điểm</label>
        <input type="text" value={formData.location}
          onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))} className={inputClass} />
      </div>

      {/* SEO */}
      <div className="rounded-xl bg-surface-container-low p-4">
        <p className="mb-3 text-body-sm font-semibold text-on-surface">SEO</p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>SEO Title <span className="normal-case tracking-normal font-normal text-on-surface-variant/50">({formData.seo_title.length}/70)</span></label>
            <input type="text" value={formData.seo_title} maxLength={70}
              onChange={(e) => setFormData(f => ({ ...f, seo_title: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>SEO Description <span className="normal-case tracking-normal font-normal text-on-surface-variant/50">({formData.seo_description.length}/160)</span></label>
            <textarea rows={2} value={formData.seo_description} maxLength={160}
              onChange={(e) => setFormData(f => ({ ...f, seo_description: e.target.value }))} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Featured */}
      <label className="flex items-center gap-2.5 rounded-lg bg-surface-container-low px-3 py-2.5 cursor-pointer">
        <input type="checkbox" checked={formData.is_featured}
          onChange={(e) => setFormData(f => ({ ...f, is_featured: e.target.checked }))}
          className="h-4 w-4 rounded accent-primary" />
        <span className="text-body-sm text-on-surface">Dự án nổi bật</span>
      </label>

      {/* Gallery */}
      <div className="rounded-xl bg-surface-container-low p-4">
        <GalleryEditor
          images={galleryImages}
          onChange={onGalleryChange}
          maxImages={30}
        />
      </div>
    </div>
  )
}

/* ================================================================
   PREVIEW MODAL
   ================================================================ */

function PreviewModal({
  title,
  description,
  contentHtml,
  coverUrl,
  onClose,
}: {
  title: string
  description: string
  contentHtml: string
  coverUrl: string | null
  onClose: () => void
}) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-on-surface/50 backdrop-blur-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-surface px-4 py-2 shadow-sm">
        <span className="font-label text-label-md text-on-surface-variant">Xem trước</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDevice('desktop')}
            className={`rounded-lg p-2 ${device === 'desktop' ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:bg-on-surface/5'}`}>
            <Monitor className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDevice('mobile')}
            className={`rounded-lg p-2 ${device === 'mobile' ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:bg-on-surface/5'}`}>
            <Smartphone className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className="ml-2 rounded-lg p-2 text-on-surface-variant hover:bg-on-surface/5">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview frame */}
      <div className="flex-1 overflow-auto bg-surface-container p-4 md:p-8">
        <div className={`mx-auto rounded-xl bg-surface shadow-ambient-lg transition-all ${
          device === 'mobile' ? 'max-w-[375px]' : 'max-w-4xl'
        }`}>
          <div className="p-6 md:p-10">
            {coverUrl && (
              <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt={title ? `${title} — ảnh bìa` : 'Ảnh bìa dự án'} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            )}
            <h1 className="font-headline text-headline-lg text-on-surface md:text-display-sm">
              {title || 'Tiêu đề bài viết'}
            </h1>
            {description && (
              <p className="mt-3 text-body-lg text-on-surface-variant">{description}</p>
            )}
            {contentHtml && (
              <div className="prose prose-lg mt-8 max-w-none text-on-surface"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN PROJECT EDITOR
   ================================================================ */

interface ProjectFormData {
  title: string
  description: string
  category_id: string
  style: string
  area: string
  location: string
  year_completed: string
  seo_title: string
  seo_description: string
  is_featured: boolean
}

// Save status hiển thị trên top bar
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function ProjectEditor({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const editorRef = useRef<BlockEditorRef>(null)

  const [project, setProject] = useState<Project | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '', description: '', category_id: '', style: '',
    area: '', location: '', year_completed: '',
    seo_title: '', seo_description: '', is_featured: false,
  })
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [coverImageId, setCoverImageId] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [contentJson, setContentJson] = useState<any>(null)
  const [initialContent, setInitialContent] = useState<any>(null)

  const [loading, setLoading] = useState(!!projectId)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedTime, setSavedTime] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [distraction, setDistraction] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // ID hiện tại (có thể thay đổi khi tạo mới)
  const [currentId, setCurrentId] = useState<string | null>(projectId || null)

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')
  // Mutex to prevent concurrent saves (manual + auto-save race condition)
  const isSavingRef = useRef(false)

  /* ── Load data ─────────────────────────────────── */

  useEffect(() => {
    api.get('/categories?type=project&limit=100').then((res: any) => {
      setCategories(res.data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!projectId) { setLoading(false); return }
    api.get(`/projects/admin/${projectId}`).then((res: any) => {
      const p: Project = res.data
      setProject(p)
      setCurrentId(p.id)
      setFormData({
        title: p.title, description: p.description || '',
        category_id: p.category_id || '', style: p.style || '',
        area: p.area || '', location: p.location || '',
        year_completed: p.year_completed?.toString() || '',
        seo_title: p.seo_title || '', seo_description: p.seo_description || '',
        is_featured: !!p.is_featured,
      })
      setCoverImageUrl(p.cover_image?.preview_url || p.cover_image?.original_url || null)
      setCoverImageId(p.cover_image_id || null)

      // Load gallery images
      if ((p as any).gallery) {
        setGalleryImages(apiGalleryToImages((p as any).gallery))
      }

      // Nội dung: thử parse JSON, fallback HTML
      if (p.content) {
        try {
          const json = JSON.parse(p.content)
          setInitialContent(json)
        } catch {
          setInitialContent(p.content)
        }
      }
    }).catch(() => {
      router.push('/admin/projects')
    }).finally(() => setLoading(false))
  }, [projectId, router])

  /* ── Build payload ─────────────────────────────── */

  const buildPayload = useCallback(() => {
    const json = editorRef.current?.getJSON()
    const payload: Record<string, unknown> = {
      title: formData.title || 'Untitled',
      description: formData.description || undefined,
      content: json ? JSON.stringify(json) : undefined,
      category_id: formData.category_id || undefined,
      style: formData.style || undefined,
      area: formData.area || undefined,
      location: formData.location || undefined,
      year_completed: formData.year_completed ? parseInt(formData.year_completed) : undefined,
      seo_title: formData.seo_title || undefined,
      seo_description: formData.seo_description || undefined,
      is_featured: formData.is_featured,
      cover_image_id: coverImageId || undefined,
    }
    return payload
  }, [formData, coverImageId])

  /* ── Save (manual) ─────────────────────────────── */

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (isSavingRef.current) return false

    // Validate truoc khi luu
    const errors = validateFields({
      title: [
        !formData.title.trim() ? 'Tiêu đề không được để trống.' : null,
        validateMinLength(formData.title, 2, 'Tiêu đề'),
      ],
      year_completed: [
        formData.year_completed && (parseInt(formData.year_completed) < 1900 || parseInt(formData.year_completed) > 2100)
          ? 'Năm phải từ 1900 đến 2100.' : null,
      ],
      seo_title: [validateMaxLength(formData.seo_title, 70, 'SEO Title')],
      seo_description: [validateMaxLength(formData.seo_description, 160, 'SEO Description')],
    })
    if (Object.keys(errors).length > 0) {
      const msg = Object.values(errors).join(' ')
      setValidationError(msg)
      setSaveStatus('error')
      return false
    }
    setValidationError(null)

    isSavingRef.current = true

    // Cancel pending auto-save khi manual save bat dau
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }

    setSaveStatus('saving')
    try {
      const payload = buildPayload()
      let saveId = currentId
      if (currentId) {
        await api.patch(`/projects/${currentId}`, payload)
      } else {
        const res = await api.post('/projects', payload) as any
        const newId = res.data?.id
        if (newId) {
          saveId = newId
          setCurrentId(newId)
          window.history.replaceState(null, '', `/admin/projects/editor?id=${newId}`)
        }
      }
      // Luu gallery images
      if (saveId) {
        const mediaIds = imagesToMediaIds(galleryImages)
        await api.patch(`/projects/${saveId}/gallery`, { media_ids: mediaIds }).catch(() => {})
      }

      setSaveStatus('saved')
      setSavedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
      // Backup localStorage
      if (currentId) localStorage.removeItem(`project-draft-${currentId}`)
      return true
    } catch {
      setSaveStatus('error')
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [buildPayload, currentId, galleryImages, formData])

  /* ── Auto-save (debounced 10s) ─────────────────── */

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    // Chi reset status khi can — tranh re-render lam dong native select dropdown
    setSaveStatus(prev => prev === 'saving' ? prev : 'idle')

    const snapshot = JSON.stringify({ formData, contentJson, coverImageId, galleryImages })
    if (snapshot === lastSavedRef.current) return

    autoSaveTimerRef.current = setTimeout(async () => {
      if (!formData.title.trim()) return
      if (isSavingRef.current) return
      isSavingRef.current = true

      setSaveStatus('saving')
      try {
        const payload = buildPayload()
        let autoSaveId = currentId
        if (currentId) {
          await api.patch(`/projects/${currentId}`, payload)
        } else {
          const res = await api.post('/projects', payload) as any
          const newId = res.data?.id
          if (newId) {
            autoSaveId = newId
            setCurrentId(newId)
            window.history.replaceState(null, '', `/admin/projects/editor?id=${newId}`)
          }
        }
        // Auto-save gallery
        if (autoSaveId) {
          const mediaIds = imagesToMediaIds(galleryImages)
          await api.patch(`/projects/${autoSaveId}/gallery`, { media_ids: mediaIds }).catch(() => {})
        }
        lastSavedRef.current = snapshot
        setSaveStatus('saved')
        setSavedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
      } catch {
        setSaveStatus('error')
        // Backup localStorage phòng lỗi
        if (typeof window !== 'undefined') {
          localStorage.setItem(`project-draft-${currentId || 'new'}`, JSON.stringify({ formData, contentJson }))
        }
      } finally {
        isSavingRef.current = false
      }
    }, 10000)
  }, [formData, contentJson, coverImageId, galleryImages, currentId, buildPayload])

  // Trigger auto-save khi data thay đổi
  useEffect(() => {
    if (loading) return
    scheduleAutoSave()
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current) }
  }, [formData, contentJson, coverImageId, galleryImages, loading, scheduleAutoSave])

  /* ── Publish ───────────────────────────────────── */

  const handlePublish = useCallback(async () => {
    const saved = await handleSave()
    if (!saved || !currentId) return
    try {
      await api.patch(`/projects/${currentId}/publish`)
      setProject(prev => prev ? { ...prev, status: 'published' } : prev)
    } catch {}
  }, [handleSave, currentId])

  /* ── Cover image ───────────────────────────────── */

  const handleCoverUpload = useCallback(async (file: File) => {
    const validationError = validateImageFile(file)
    if (validationError) return
    const base64 = await fileToBase64(file)
    setCoverImageUrl(base64)
    try {
      const media = await uploadMedia(file)
      setCoverImageUrl(media.preview_url || media.original_url)
      setCoverImageId(media.id)
    } catch {
      // Giu lai base64 preview neu upload fail
    }
  }, [])

  /* ── Keyboard shortcuts ────────────────────────── */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave, showPreview])

  /* ── Render ────────────────────────────────────── */

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const status = project?.status || 'draft'

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-surface ${distraction ? '' : ''}`}>
      {/* ── TOP BAR ────────────────────────────────── */}
      {!distraction && (
        <div className="flex shrink-0 items-center justify-between border-b border-on-surface/8 bg-surface px-4 py-2">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push('/admin/projects')}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-body-sm text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dự án</span>
            </button>
            {/* Save status */}
            <div className="flex items-center gap-1.5 text-body-sm">
              {saveStatus === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin text-on-surface-variant" /><span className="text-on-surface-variant">Đang lưu...</span></>}
              {saveStatus === 'saved' && <><Check className="h-3.5 w-3.5 text-success" /><span className="text-success">Đã lưu {savedTime}</span></>}
              {saveStatus === 'error' && <><AlertCircle className="h-3.5 w-3.5 text-error" /><span className="text-error">{validationError || 'Lỗi lưu'}</span></>}
              {saveStatus === 'idle' && savedTime && <span className="text-on-surface-variant/50">Lưu lần cuối {savedTime}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setDistraction(true)} title="Chế độ tập trung"
              className="hidden sm:flex rounded-lg p-2 text-on-surface-variant hover:bg-on-surface/5">
              <Maximize2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setShowSidebar(!showSidebar)} title="Cài đặt"
              className="hidden sm:flex rounded-lg p-2 text-on-surface-variant hover:bg-on-surface/5">
              {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setShowPreview(true)} title="Xem trước"
              className="flex items-center gap-1.5 rounded-lg p-2 sm:px-3 sm:py-1.5 text-body-sm text-on-surface-variant hover:bg-on-surface/5">
              <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Xem trước</span>
            </button>
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Lưu nháp</span>
            </Button>
            <Button size="sm" onClick={handlePublish}>
              <span className="hidden sm:inline">Xuất bản</span>
              <span className="sm:hidden">Lưu</span>
            </Button>
          </div>
        </div>
      )}

      {/* Distraction-free minimize bar */}
      {distraction && (
        <button type="button" onClick={() => setDistraction(false)}
          className="absolute right-4 top-4 z-10 rounded-lg bg-surface-container p-2 text-on-surface-variant shadow-ambient-sm hover:bg-surface-container-high">
          <Minimize2 className="h-4 w-4" />
        </button>
      )}

      {/* ── MAIN CONTENT ──────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 overflow-y-auto">
          <div className={`mx-auto ${distraction ? 'max-w-3xl px-4 py-8' : 'max-w-4xl px-4 py-6 md:px-8'}`}>
            {/* Cover Image */}
            <CoverImageUpload
              imageUrl={coverImageUrl}
              onUpload={handleCoverUpload}
              onRemove={() => { setCoverImageUrl(null); setCoverImageId(null) }}
            />

            {/* Title — large, no-border, WordPress style */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="Tiêu đề bài viết..."
              className="mt-6 w-full bg-transparent font-headline text-display-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none md:text-display-md"
            />

            {/* Description */}
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn về dự án..."
              rows={2}
              className="mt-3 w-full resize-none bg-transparent text-body-lg text-on-surface-variant placeholder:text-on-surface-variant/30 focus:outline-none"
            />

            {/* Block Editor */}
            <div className="mt-6">
              <BlockEditor
                ref={editorRef}
                initialContent={initialContent}
                onChange={(json) => setContentJson(json)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && !distraction && (
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-on-surface/8 bg-surface-container-lowest p-5 lg:block xl:w-80">
            <EditorSidebar
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              status={status}
              galleryImages={galleryImages}
              onGalleryChange={setGalleryImages}
            />
          </aside>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          title={formData.title}
          description={formData.description}
          contentHtml={editorRef.current?.getHTML() || ''}
          coverUrl={coverImageUrl}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
