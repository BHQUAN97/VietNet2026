'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  Check,
  Loader2,
  Globe,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/DataStates'
import { getErrorMessage } from '@/lib/error'
import { validateEmail as valEmail, validateUrl, validatePhoneVN, validateMaxLength } from '@/lib/form-validation'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

// ─── Types ─────────────────────────────────────────────────────

interface SettingItem {
  key: string
  value: string
  group: string
}

type TabId = 'site' | 'seo'

// ─── Tab definition ────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'site', label: 'Cài đặt chung', icon: <Globe className="h-4 w-4" /> },
  { id: 'seo', label: 'SEO mặc định', icon: <Search className="h-4 w-4" /> },
]

// ─── Site settings fields ──────────────────────────────────────

const SITE_FIELDS: {
  key: string
  label: string
  placeholder: string
  type?: 'text' | 'textarea' | 'email' | 'tel' | 'url'
}[] = [
  { key: 'company_name', label: 'Tên công ty', placeholder: 'VietNet Interior' },
  { key: 'slogan', label: 'Slogan', placeholder: 'Nội thất tinh tế - Không gian hoàn hảo' },
  {
    key: 'address',
    label: 'Địa chỉ',
    placeholder: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    type: 'textarea',
  },
  { key: 'phone', label: 'Số điện thoại', placeholder: '0901234567', type: 'tel' },
  { key: 'email', label: 'Email', placeholder: 'contact@bhquan.site', type: 'email' },
  {
    key: 'working_hours',
    label: 'Giờ làm việc',
    placeholder: 'T2-T7: 8:00 - 17:30',
  },
  {
    key: 'social_facebook',
    label: 'Facebook URL',
    placeholder: 'https://facebook.com/vietnetinterior',
    type: 'url',
  },
  {
    key: 'social_zalo',
    label: 'Zalo URL',
    placeholder: 'https://zalo.me/0901234567',
    type: 'url',
  },
  {
    key: 'social_instagram',
    label: 'Instagram URL',
    placeholder: 'https://instagram.com/vietnetinterior',
    type: 'url',
  },
  {
    key: 'social_youtube',
    label: 'YouTube URL',
    placeholder: 'https://youtube.com/@vietnetinterior',
    type: 'url',
  },
]

const SEO_FIELDS: {
  key: string
  label: string
  placeholder: string
  type?: 'text' | 'textarea' | 'url'
  maxLength?: number
  help?: string
}[] = [
  {
    key: 'seo_title_template',
    label: 'Template tiêu đề SEO',
    placeholder: '{title} | VietNet Interior',
    help: 'Sử dụng {title} để chèn tiêu đề trang. VD: {title} | VietNet Interior',
  },
  {
    key: 'seo_default_description',
    label: 'Mô tả SEO mặc định',
    placeholder: 'VietNet Interior - Thiết kế nội thất cao cấp...',
    type: 'textarea',
    maxLength: 160,
    help: 'Tối đa 160 ký tự. Hiển thị khi trang không có mô tả riêng.',
  },
  {
    key: 'seo_default_og_image',
    label: 'Ảnh OG mặc định (URL)',
    placeholder: 'https://cdn.bhquan.site/og-default.jpg',
    type: 'url',
    help: 'Kích thước khuyến nghị: 1200x630px. Sử dụng khi trang không có ảnh riêng.',
  },
]

// ─── Toast Component ───────────────────────────────────────────

function Toast({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-[var(--z-toast,50)] flex items-center gap-2 rounded-xl bg-success-bg px-4 py-3 shadow-ambient-lg animate-in slide-in-from-bottom-4">
      <Check className="h-4 w-4 text-success-text" />
      <p className="text-body-sm font-medium text-success-text">{message}</p>
    </div>
  )
}

// ─── Main Settings Page ────────────────────────────────────────

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('site')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Track original values for dirty check
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({})

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = (await api.get('/settings')) as unknown as ApiResponse<SettingItem[]>
      const map: Record<string, string> = {}
      if (Array.isArray(res.data)) {
        res.data.forEach((item) => {
          map[item.key] = item.value
        })
      }
      setSettings(map)
      setOriginalSettings(map)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  const currentFields = activeTab === 'site' ? SITE_FIELDS : SEO_FIELDS
  const currentGroup = activeTab === 'site' ? 'site' : 'seo'

  // Check if any field in current tab is dirty
  const isDirty = currentFields.some(
    (f) => (settings[f.key] || '') !== (originalSettings[f.key] || '')
  )

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    setFieldErrors({})

    // Validate truoc khi luu
    const newFieldErrors: Record<string, string> = {}
    const emailVal = settings['email'] || ''
    if (emailVal.trim()) {
      const emailErr = valEmail(emailVal)
      // valEmail returns error for empty too, only check format
      if (emailVal.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        newFieldErrors['email'] = 'Email không hợp lệ.'
      }
    }
    const phoneVal = settings['phone'] || ''
    if (phoneVal.trim()) {
      const phoneErr = validatePhoneVN(phoneVal)
      if (phoneErr) newFieldErrors['phone'] = phoneErr
    }
    // Validate social URLs
    for (const key of ['social_facebook', 'social_zalo', 'social_instagram', 'social_youtube']) {
      const val = settings[key] || ''
      if (val.trim()) {
        const urlErr = validateUrl(val)
        if (urlErr) newFieldErrors[key] = urlErr
      }
    }
    // SEO description max 160
    const seoDescVal = settings['seo_default_description'] || ''
    if (seoDescVal.length > 160) {
      newFieldErrors['seo_default_description'] = 'Mô tả SEO không được vượt quá 160 ký tự.'
    }
    // OG image URL
    const ogImageVal = settings['seo_default_og_image'] || ''
    if (ogImageVal.trim()) {
      const urlErr = validateUrl(ogImageVal)
      if (urlErr) newFieldErrors['seo_default_og_image'] = urlErr
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      setIsSaving(false)
      return
    }

    try {
      // Only save changed fields
      const changedFields = currentFields.filter(
        (f) => (settings[f.key] || '') !== (originalSettings[f.key] || '')
      )

      await Promise.all(
        changedFields.map((field) =>
          api.put(`/settings/${field.key}`, {
            value: settings[field.key] || '',
            group: currentGroup,
          })
        )
      )

      // Update original to match saved
      setOriginalSettings((prev) => {
        const updated = { ...prev }
        changedFields.forEach((f) => {
          updated[f.key] = settings[f.key] || ''
        })
        return updated
      })

      setToastMessage('Đã lưu cài đặt thành công!')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="py-4">
      {/* Header */}
      <PageHeader
        title="Cài đặt"
        description="Cấu hình hệ thống và tùy chỉnh."
        showDecoLine={false}
      />

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
          <p className="text-body-sm text-on-error-container">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-body-sm text-on-error-container underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] text-body-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {isLoading ? (
        <LoadingSpinner minHeight="min-h-[30vh]" />
      ) : (
        <div className="rounded-2xl bg-surface-container-lowest p-6 md:p-8">
          <div className="space-y-6">
            {currentFields.map((field) => {
              const value = settings[field.key] || ''
              const fieldType = field.type || 'text'
              const maxLength = 'maxLength' in field ? (field.maxLength as number) : undefined
              const help = 'help' in field ? (field.help as string) : undefined

              return (
                <div key={field.key}>
                  <label className="mb-1 block font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    {field.label}
                  </label>
                  {help && (
                    <p className="mb-2 text-body-sm text-on-surface-variant/70">{help}</p>
                  )}
                  {fieldType === 'textarea' ? (
                    <div>
                      <textarea
                        rows={3}
                        value={value}
                        onChange={(e) => updateSetting(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={maxLength}
                        className={`w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 ${fieldErrors[field.key] ? 'ring-error/30' : 'focus:ring-primary'}`}
                      />
                      {maxLength && (
                        <p className="mt-1 text-right text-body-sm text-on-surface-variant">
                          {value.length}/{maxLength}
                        </p>
                      )}
                    </div>
                  ) : (
                    <input
                      type={fieldType}
                      value={value}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 ${fieldErrors[field.key] ? 'ring-error/30' : 'focus:ring-primary'}`}
                    />
                  )}
                  {fieldErrors[field.key] && (
                    <p className="mt-1 text-body-sm text-error">{fieldErrors[field.key]}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Save button */}
          <div className="mt-8 flex items-center justify-end gap-3">
            {isDirty && (
              <p className="text-body-sm text-on-surface-variant">
                Có thay đổi chưa lưu.
              </p>
            )}
            <Button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              loading={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu cài đặt'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}
