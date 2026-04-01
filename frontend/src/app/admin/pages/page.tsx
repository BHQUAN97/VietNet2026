'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Save,
  Eye,
  Upload,
  GripVertical,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Undo2,
  History,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import type {
  PageConfig,
  PageConfigData,
  PageSection,
  PageSectionType,
  HeroConfig,
  FeaturedProjectsConfig,
  AboutConfig,
  LatestArticlesConfig,
  ContactCtaConfig,
  TestimonialsConfig,
  PageConfigHistory,
} from '@/types'
import { DEFAULT_HOMEPAGE_CONFIG } from '@/lib/default-homepage'

const SECTION_TYPE_LABELS: Record<PageSectionType, string> = {
  hero: 'Hero Banner',
  featured_projects: 'Dự án tiêu biểu',
  about: 'Về chúng tôi',
  latest_articles: 'Bài viết mới nhất',
  contact_cta: 'Liên hệ CTA',
  testimonials: 'Đánh giá khách hàng',
  custom_html: 'HTML tự do',
}

const NEW_SECTION_DEFAULTS: Record<PageSectionType, unknown> = {
  hero: {
    title: 'Tiêu đề',
    subtitle: 'Mô tả ngắn',
    label: 'Nhãn',
    cta_primary_text: 'Hành động',
    cta_primary_link: '/',
    cta_secondary_text: '',
    cta_secondary_link: '',
    bg_image_url: null,
  } as HeroConfig,
  featured_projects: {
    label: 'Dự án',
    title: 'Dự án tiêu biểu',
    limit: 6,
    cta_text: 'Xem tất cả',
    cta_link: '/projects',
  } as FeaturedProjectsConfig,
  about: {
    label: 'Về chúng tôi',
    title: 'Giới thiệu',
    description: 'Mô tả về công ty.',
    stats: [],
  } as AboutConfig,
  latest_articles: {
    label: 'Tin tức',
    title: 'Bài viết mới nhất',
    limit: 3,
  } as LatestArticlesConfig,
  contact_cta: {
    title: 'Liên hệ ngay',
    description: 'Liên hệ để được tư vấn.',
    cta_text: 'Liên hệ',
    cta_link: '/contact',
  } as ContactCtaConfig,
  testimonials: {
    label: 'Đánh giá',
    title: 'Khách hàng nói gì',
    items: [],
  } as TestimonialsConfig,
  custom_html: { html: '' },
}

function generateId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function AdminPagesPage() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<PageConfigHistory[]>([])

  const PAGE_SLUG = 'homepage'

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get(`/pages/${PAGE_SLUG}/draft`) as any
      const config = res.data as PageConfig
      setPageConfig(config)
      const draft = config.config_draft as PageConfigData | null
      setSections(draft?.sections || DEFAULT_HOMEPAGE_CONFIG.sections)
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Page config doesn't exist yet, use defaults
        setSections(DEFAULT_HOMEPAGE_CONFIG.sections)
      } else {
        setError('Không thể tải cấu hình trang.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const saveDraft = async () => {
    setIsSaving(true)
    setSaveStatus(null)
    try {
      const configData: PageConfigData = { sections }
      if (pageConfig) {
        await api.patch(`/pages/${PAGE_SLUG}/draft`, {
          config_draft: configData,
        })
      } else {
        const res = await api.post('/pages', {
          page_slug: PAGE_SLUG,
          config_draft: configData,
        }) as any
        setPageConfig(res.data)
      }
      setSaveStatus('Đã lưu bản nháp')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch {
      setError('Lưu bản nháp thất bại.')
    } finally {
      setIsSaving(false)
    }
  }

  const publishConfig = async () => {
    setIsPublishing(true)
    setError(null)
    try {
      // Auto-save draft first
      const configData: PageConfigData = { sections }
      if (pageConfig) {
        await api.patch(`/pages/${PAGE_SLUG}/draft`, {
          config_draft: configData,
        })
      } else {
        const res = await api.post('/pages', {
          page_slug: PAGE_SLUG,
          config_draft: configData,
        }) as any
        setPageConfig(res.data)
      }

      const res = await api.post(`/pages/${PAGE_SLUG}/publish`) as any
      setPageConfig(res.data)
      setSaveStatus('Đã xuất bản thành công!')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch {
      setError('Xuất bản thất bại.')
    } finally {
      setIsPublishing(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/pages/${PAGE_SLUG}/history`) as any
      setHistory(res.data || [])
      setShowHistory(true)
    } catch {
      setError('Không thể tải lịch sử.')
    }
  }

  const rollbackToVersion = async (version: number) => {
    try {
      const res = await api.post(`/pages/${PAGE_SLUG}/rollback/${version}`) as any
      setPageConfig(res.data)
      const draft = (res.data.config_draft as PageConfigData) || { sections: [] }
      setSections(draft.sections)
      setShowHistory(false)
      setSaveStatus(`Đã khôi phục bản nháp về phiên bản ${version}`)
      setTimeout(() => setSaveStatus(null), 3000)
    } catch {
      setError('Khôi phục thất bại.')
    }
  }

  // Section manipulation
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newSections.length) return

    const temp = newSections[index].order
    newSections[index].order = newSections[targetIndex].order
    newSections[targetIndex].order = temp
    ;[newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ]
    setSections(newSections)
  }

  const toggleVisibility = (index: number) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], visible: !newSections[index].visible }
    setSections(newSections)
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const addSection = (type: PageSectionType) => {
    const newSection: PageSection = {
      id: generateId(),
      type,
      order: sections.length + 1,
      visible: true,
      config: NEW_SECTION_DEFAULTS[type] as any,
    }
    setSections([...sections, newSection])
  }

  const updateSectionConfig = (index: number, key: string, value: unknown) => {
    const newSections = [...sections]
    newSections[index] = {
      ...newSections[index],
      config: { ...newSections[index].config, [key]: value },
    }
    setSections(newSections)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-headline-md text-on-surface">
            Page Builder
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Trang chủ — Phiên bản {pageConfig?.version || 0}
            {pageConfig?.published_at && (
              <> — Xuất bản lúc {new Date(pageConfig.published_at).toLocaleString('vi-VN')}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-body-sm text-primary">{saveStatus}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHistory}
            disabled={!pageConfig}
          >
            <History className="mr-2 h-4 w-4" />
            Lịch sử
          </Button>
          <a
            href={`/api/draft/enable?secret=${encodeURIComponent(
              process.env.NEXT_PUBLIC_PREVIEW_SECRET || 'preview-secret',
            )}&slug=/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Xem trước
            </Button>
          </a>
          <Button variant="secondary" size="sm" onClick={saveDraft} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu nháp
          </Button>
          <Button size="sm" onClick={publishConfig} disabled={isPublishing}>
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Xuất bản
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container p-4 text-body-sm text-on-error-container">
          {error}
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="rounded-xl bg-surface-container-low p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-title-lg text-on-surface">
              Lịch sử phiên bản
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
              Đóng
            </Button>
          </div>
          {history.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              Chưa có lịch sử phiên bản nào.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg bg-surface p-3"
                >
                  <div>
                    <span className="font-label text-label-lg text-on-surface">
                      Phiên bản {h.version}
                    </span>
                    <span className="ml-3 text-body-sm text-on-surface-variant">
                      {h.published_at
                        ? new Date(h.published_at).toLocaleString('vi-VN')
                        : ''}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => rollbackToVersion(h.version)}
                  >
                    <Undo2 className="mr-1 h-4 w-4" />
                    Khôi phục
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`rounded-xl transition-all ${
              section.visible
                ? 'bg-surface-container-low'
                : 'bg-surface-container-low/50 opacity-60'
            }`}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="h-5 w-5 shrink-0 text-on-surface-variant/40" />
              <div className="flex-1">
                <span className="font-label text-label-lg text-on-surface">
                  {SECTION_TYPE_LABELS[section.type]}
                </span>
                {!section.visible && (
                  <span className="ml-2 text-body-sm text-on-surface-variant">(Ẩn)</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleVisibility(index)}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                >
                  {section.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => removeSection(index)}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === section.id ? null : section.id,
                    )
                  }
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                >
                  {expandedSection === section.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Section config editor */}
            {expandedSection === section.id && (
              <div className="mt-2 bg-surface-container-low/50 rounded-xl px-4 py-4">
                <SectionConfigEditor
                  section={section}
                  index={index}
                  onUpdate={updateSectionConfig}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add section */}
      <div className="rounded-xl border-2 border-dashed border-outline-variant/30 p-6">
        <p className="mb-3 text-center font-label text-label-lg text-on-surface-variant">
          Thêm section mới
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.keys(SECTION_TYPE_LABELS) as PageSectionType[]).map((type) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => addSection(type)}
            >
              <Plus className="mr-1 h-4 w-4" />
              {SECTION_TYPE_LABELS[type]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section Config Editors ──────────────────────────────

interface ConfigEditorProps {
  section: PageSection
  index: number
  onUpdate: (index: number, key: string, value: unknown) => void
}

function FieldInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block font-label text-label-md text-on-surface-variant">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
        />
      )}
    </div>
  )
}

function FieldNumber({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="mb-1 block font-label text-label-md text-on-surface-variant">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  )
}

function SectionConfigEditor({ section, index, onUpdate }: ConfigEditorProps) {
  const config = section.config as Record<string, any>

  switch (section.type) {
    case 'hero':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput label="Nhãn" value={config.label || ''} onChange={(v) => onUpdate(index, 'label', v)} />
          <FieldInput label="Tiêu đề" value={config.title || ''} onChange={(v) => onUpdate(index, 'title', v)} />
          <div className="sm:col-span-2">
            <FieldInput label="Mô tả" value={config.subtitle || ''} onChange={(v) => onUpdate(index, 'subtitle', v)} multiline />
          </div>
          <FieldInput label="Nút chính - Text" value={config.cta_primary_text || ''} onChange={(v) => onUpdate(index, 'cta_primary_text', v)} />
          <FieldInput label="Nút chính - Link" value={config.cta_primary_link || ''} onChange={(v) => onUpdate(index, 'cta_primary_link', v)} />
          <FieldInput label="Nút phụ - Text" value={config.cta_secondary_text || ''} onChange={(v) => onUpdate(index, 'cta_secondary_text', v)} />
          <FieldInput label="Nút phụ - Link" value={config.cta_secondary_link || ''} onChange={(v) => onUpdate(index, 'cta_secondary_link', v)} />
          <div className="sm:col-span-2">
            <FieldInput label="URL ảnh nền" value={config.bg_image_url || ''} onChange={(v) => onUpdate(index, 'bg_image_url', v || null)} />
          </div>
        </div>
      )

    case 'featured_projects':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput label="Nhãn" value={config.label || ''} onChange={(v) => onUpdate(index, 'label', v)} />
          <FieldInput label="Tiêu đề" value={config.title || ''} onChange={(v) => onUpdate(index, 'title', v)} />
          <FieldNumber label="Số lượng" value={config.limit || 6} onChange={(v) => onUpdate(index, 'limit', v)} />
          <FieldInput label="CTA text" value={config.cta_text || ''} onChange={(v) => onUpdate(index, 'cta_text', v)} />
          <FieldInput label="CTA link" value={config.cta_link || ''} onChange={(v) => onUpdate(index, 'cta_link', v)} />
        </div>
      )

    case 'about':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput label="Nhãn" value={config.label || ''} onChange={(v) => onUpdate(index, 'label', v)} />
            <FieldInput label="Tiêu đề" value={config.title || ''} onChange={(v) => onUpdate(index, 'title', v)} />
          </div>
          <FieldInput label="Mô tả" value={config.description || ''} onChange={(v) => onUpdate(index, 'description', v)} multiline />
          <div>
            <label className="mb-2 block font-label text-label-md text-on-surface-variant">
              Thống kê
            </label>
            {(config.stats || []).map((stat: any, si: number) => (
              <div key={si} className="mb-2 flex gap-2">
                <input
                  value={stat.value}
                  onChange={(e) => {
                    const newStats = [...(config.stats || [])]
                    newStats[si] = { ...newStats[si], value: e.target.value }
                    onUpdate(index, 'stats', newStats)
                  }}
                  placeholder="Giá trị (vd: 10+)"
                  className="w-1/3 rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...(config.stats || [])]
                    newStats[si] = { ...newStats[si], label: e.target.value }
                    onUpdate(index, 'stats', newStats)
                  }}
                  placeholder="Nhãn (vd: Năm kinh nghiệm)"
                  className="flex-1 rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={() => {
                    const newStats = (config.stats || []).filter((_: any, i: number) => i !== si)
                    onUpdate(index, 'stats', newStats)
                  }}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newStats = [...(config.stats || []), { value: '', label: '' }]
                onUpdate(index, 'stats', newStats)
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm thống kê
            </Button>
          </div>
        </div>
      )

    case 'latest_articles':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput label="Nhãn" value={config.label || ''} onChange={(v) => onUpdate(index, 'label', v)} />
          <FieldInput label="Tiêu đề" value={config.title || ''} onChange={(v) => onUpdate(index, 'title', v)} />
          <FieldNumber label="Số lượng" value={config.limit || 3} onChange={(v) => onUpdate(index, 'limit', v)} />
        </div>
      )

    case 'contact_cta':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput label="Tiêu đề" value={config.title || ''} onChange={(v) => onUpdate(index, 'title', v)} />
          <FieldInput label="CTA text" value={config.cta_text || ''} onChange={(v) => onUpdate(index, 'cta_text', v)} />
          <div className="sm:col-span-2">
            <FieldInput label="Mô tả" value={config.description || ''} onChange={(v) => onUpdate(index, 'description', v)} multiline />
          </div>
          <FieldInput label="CTA link" value={config.cta_link || ''} onChange={(v) => onUpdate(index, 'cta_link', v)} />
        </div>
      )

    case 'testimonials':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput label="Nhãn" value={config.label || ''} onChange={(v) => onUpdate(index, 'label', v)} />
            <FieldInput label="Tiêu đề" value={config.title || ''} onChange={(v) => onUpdate(index, 'title', v)} />
          </div>
          <div>
            <label className="mb-2 block font-label text-label-md text-on-surface-variant">
              Đánh giá
            </label>
            {(config.items || []).map((item: any, ti: number) => (
              <div key={ti} className="mb-3 rounded-lg bg-surface p-3">
                <div className="mb-2 grid gap-2 sm:grid-cols-2">
                  <input
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...(config.items || [])]
                      newItems[ti] = { ...newItems[ti], name: e.target.value }
                      onUpdate(index, 'items', newItems)
                    }}
                    placeholder="Tên"
                    className="rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={item.role}
                    onChange={(e) => {
                      const newItems = [...(config.items || [])]
                      newItems[ti] = { ...newItems[ti], role: e.target.value }
                      onUpdate(index, 'items', newItems)
                    }}
                    placeholder="Vai trò"
                    className="rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <textarea
                  value={item.content}
                  onChange={(e) => {
                    const newItems = [...(config.items || [])]
                    newItems[ti] = { ...newItems[ti], content: e.target.value }
                    onUpdate(index, 'items', newItems)
                  }}
                  placeholder="Nội dung đánh giá"
                  rows={2}
                  className="w-full rounded-lg bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      const newItems = (config.items || []).filter((_: any, i: number) => i !== ti)
                      onUpdate(index, 'items', newItems)
                    }}
                    className="rounded-lg p-1 text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newItems = [
                  ...(config.items || []),
                  { name: '', role: '', content: '', avatar_url: '' },
                ]
                onUpdate(index, 'items', newItems)
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm đánh giá
            </Button>
          </div>
        </div>
      )

    case 'custom_html':
      return (
        <FieldInput
          label="HTML"
          value={config.html || ''}
          onChange={(v) => onUpdate(index, 'html', v)}
          multiline
        />
      )

    default:
      return <p className="text-body-sm text-on-surface-variant">Không hỗ trợ chỉnh sửa section này.</p>
  }
}
