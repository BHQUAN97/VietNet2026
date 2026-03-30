'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

interface FormData {
  name: string
  email: string
  phone: string
  project_type: string
  area: string
  budget_range: string
  message: string
  _honey: string // honeypot
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

const PROJECT_TYPES = [
  { value: '', label: 'Chon loai du an' },
  { value: 'residential', label: 'Nha o' },
  { value: 'commercial', label: 'Thuong mai' },
  { value: 'hospitality', label: 'Khach san / Resort' },
  { value: 'renovation', label: 'Cai tao' },
  { value: 'other', label: 'Khac' },
]

const BUDGET_RANGES = [
  { value: '', label: 'Chon ngan sach du kien' },
  { value: 'under_500m', label: 'Duoi 500 trieu' },
  { value: '500m_1b', label: '500 trieu - 1 ty' },
  { value: '1b_3b', label: '1 ty - 3 ty' },
  { value: '3b_5b', label: '3 ty - 5 ty' },
  { value: 'above_5b', label: 'Tren 5 ty' },
]

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Dien thoai',
    value: '0909 123 456',
    href: 'tel:0909123456',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@bhquan.site',
    href: 'mailto:hello@bhquan.site',
  },
  {
    icon: MapPin,
    label: 'Dia chi',
    value: 'Quan 1, TP. Ho Chi Minh',
    href: null,
  },
  {
    icon: Clock,
    label: 'Gio lam viec',
    value: 'T2 - T7: 8:00 - 18:00',
    href: null,
  },
]

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const inputBaseClasses =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all duration-300 focus:bg-surface-container focus:ring-2 focus:ring-primary/20 min-h-[44px]'

const labelClasses = 'block font-label text-label-lg tracking-label-wide text-on-surface-variant mb-2'

export function ConsultationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    project_type: '',
    area: '',
    budget_range: '',
    message: '',
    _honey: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (apiError) setApiError(null)
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Vui long nhap ho ten'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui long nhap email'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email khong hop le'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Vui long nhap noi dung'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Honeypot check
    if (formData._honey) return

    if (!validate()) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      const { _honey, ...submitData } = formData
      await api.post('/consultations', submitData)
      setIsSuccess(true)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Co loi xay ra. Vui long thu lai sau.'
      setApiError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-low px-8 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-[scale-in_0.5s_ease-out]">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="font-headline text-headline-md text-on-surface">
          Cam on ban da lien he!
        </h3>
        <p className="mt-3 max-w-md text-body-md text-on-surface-variant">
          Chung toi da nhan duoc yeu cau tu van cua ban. Doi ngu VietNet Interior se lien he lai
          trong vong 24 gio lam viec.
        </p>
        <Button
          variant="ghost"
          className="mt-8"
          onClick={() => {
            setIsSuccess(false)
            setFormData({
              name: '',
              email: '',
              phone: '',
              project_type: '',
              area: '',
              budget_range: '',
              message: '',
              _honey: '',
            })
          }}
        >
          Gui yeu cau khac
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
      {/* Left: Contact Info */}
      <div className="lg:col-span-2">
        <h2 className="font-headline text-headline-md text-on-surface">
          Thong tin lien he
        </h2>
        <p className="mt-3 text-body-md text-on-surface-variant">
          Lien he truc tiep hoac de lai thong tin, chung toi se lien he lai trong thoi gian som nhat.
        </p>

        <div className="mt-10 space-y-6">
          {CONTACT_INFO.map((item) => {
            const Icon = item.icon
            const content = (
              <div className="flex items-start gap-4 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-label text-label-lg tracking-label-wide text-on-surface-variant">
                    {item.label}
                  </p>
                  <p className="mt-1 text-body-md text-on-surface font-medium">
                    {item.value}
                  </p>
                </div>
              </div>
            )

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="block rounded-xl p-2 -m-2 transition-colors duration-300 hover:bg-surface-container-low"
                >
                  {content}
                </a>
              )
            }

            return <div key={item.label}>{content}</div>
          })}
        </div>
      </div>

      {/* Right: Form */}
      <div className="lg:col-span-3">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface-container-low p-6 md:p-8" noValidate>
          {apiError && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
              <p className="text-body-sm text-on-error-container">{apiError}</p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="name" className={labelClasses}>
                Ho ten <span className="text-error">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nguyen Van A"
                className={cn(inputBaseClasses, errors.name && 'ring-2 ring-error/30')}
              />
              {errors.name && (
                <p className="mt-1.5 text-body-sm text-error">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email <span className="text-error">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className={cn(inputBaseClasses, errors.email && 'ring-2 ring-error/30')}
              />
              {errors.email && (
                <p className="mt-1.5 text-body-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClasses}>
                Dien thoai
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0909 xxx xxx"
                className={inputBaseClasses}
              />
            </div>

            {/* Project Type */}
            <div>
              <label htmlFor="project_type" className={labelClasses}>
                Loai du an
              </label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className={cn(inputBaseClasses, 'appearance-none cursor-pointer')}
              >
                {PROJECT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <label htmlFor="area" className={labelClasses}>
                Dien tich (m2)
              </label>
              <input
                id="area"
                name="area"
                type="text"
                value={formData.area}
                onChange={handleChange}
                placeholder="VD: 120"
                className={inputBaseClasses}
              />
            </div>

            {/* Budget Range */}
            <div>
              <label htmlFor="budget_range" className={labelClasses}>
                Ngan sach du kien
              </label>
              <select
                id="budget_range"
                name="budget_range"
                value={formData.budget_range}
                onChange={handleChange}
                className={cn(inputBaseClasses, 'appearance-none cursor-pointer')}
              >
                {BUDGET_RANGES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="mt-5">
            <label htmlFor="message" className={labelClasses}>
              Noi dung yeu cau <span className="text-error">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Mo ta yeu cau thiet ke, phong cach mong muon, thoi gian du kien..."
              className={cn(inputBaseClasses, 'resize-none', errors.message && 'ring-2 ring-error/30')}
            />
            {errors.message && (
              <p className="mt-1.5 text-body-sm text-error">{errors.message}</p>
            )}
          </div>

          {/* Honeypot - hidden from real users */}
          <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
            <input
              type="text"
              name="_honey"
              tabIndex={-1}
              autoComplete="off"
              value={formData._honey}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="mt-8 w-full md:w-auto"
          >
            Gui yeu cau tu van
          </Button>
        </form>
      </div>
    </div>
  )
}
