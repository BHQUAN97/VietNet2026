'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, CheckCircle, AlertTriangle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/error'
import { validateRequired, validateEmail, validateFields } from '@/lib/form-validation'

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
  phone?: string
  email?: string
  area?: string
  message?: string
}

const PROJECT_TYPES = [
  { value: '', label: 'Chọn loại dự án' },
  { value: 'residential', label: 'Nhà ở' },
  { value: 'commercial', label: 'Thương mại' },
  { value: 'hospitality', label: 'Khách sạn / Resort' },
  { value: 'renovation', label: 'Cải tạo' },
  { value: 'other', label: 'Khác' },
]

const BUDGET_RANGES = [
  { value: '', label: 'Chọn ngân sách dự kiến' },
  { value: 'under_500m', label: 'Dưới 500 triệu' },
  { value: '500m_1b', label: '500 triệu - 1 tỷ' },
  { value: '1b_3b', label: '1 tỷ - 3 tỷ' },
  { value: '3b_5b', label: '3 tỷ - 5 tỷ' },
  { value: 'above_5b', label: 'Trên 5 tỷ' },
]

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Điện thoại',
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
    label: 'Địa chỉ',
    value: 'Quận 1, TP. Hồ Chí Minh',
    href: null,
  },
  {
    icon: Clock,
    label: 'Giờ làm việc',
    value: 'T2 - T7: 8:00 - 18:00',
    href: null,
  },
]

const inputBaseClasses =
  'w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all duration-300 focus:bg-surface focus:shadow-ambient-sm focus:ring-2 focus:ring-primary/15 min-h-[44px] md:text-body-md md:py-3.5 md:min-h-[48px]'

const labelClasses = 'block font-label text-label-md tracking-[0.06em] text-on-surface-variant mb-2'

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

    // Họ tên: bắt buộc, 2-100 ký tự
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên'
    else if (formData.name.trim().length < 2) newErrors.name = 'Họ tên cần ít nhất 2 ký tự'
    else if (formData.name.trim().length > 100) newErrors.name = 'Họ tên tối đa 100 ký tự'

    // SĐT: bắt buộc, chỉ cho phép số/dấu cách/dấu gạch, 8-20 ký tự
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^[\d\s\-+().]{8,20}$/.test(formData.phone.trim())) newErrors.phone = 'Số điện thoại không hợp lệ'

    // Email: tùy chọn — chỉ validate format nếu có nhập
    if (formData.email.trim()) {
      const emailErr = validateEmail(formData.email)
      if (emailErr) newErrors.email = emailErr
    }

    // Diện tích: tùy chọn — validate max length
    if (formData.area.trim().length > 50) newErrors.area = 'Diện tích tối đa 50 ký tự'

    // Nội dung: bắt buộc, 5-2000 ký tự
    if (!formData.message.trim()) newErrors.message = 'Vui lòng nhập nội dung'
    else if (formData.message.trim().length < 5) newErrors.message = 'Nội dung cần ít nhất 5 ký tự'
    else if (formData.message.trim().length > 2000) newErrors.message = 'Nội dung tối đa 2000 ký tự'

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
      const { _honey, email, ...submitData } = formData
      // Chi gui email neu co nhap, khong gui honeypot
      await api.post('/consultations', {
        ...submitData,
        email: email.trim() || undefined,
      })
      setIsSuccess(true)
    } catch (err: unknown) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-low px-6 py-16 text-center md:px-8 md:py-20">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 animate-scale-in md:h-20 md:w-20">
          <CheckCircle className="h-8 w-8 text-primary md:h-10 md:w-10" />
        </div>
        <h3 className="font-headline text-headline-sm text-on-surface md:text-headline-md">
          Cảm ơn bạn đã liên hệ!
        </h3>
        <p className="mt-3 max-w-md text-body-sm leading-relaxed text-on-surface-variant md:text-body-md">
          Chúng tôi đã nhận được yêu cầu tư vấn của bạn. Đội ngũ VietNet Interior sẽ liên hệ lại
          trong vòng 24 giờ làm việc.
        </p>
        <Button
          variant="ghost"
          className="mt-6"
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
          Gửi yêu cầu khác
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
      {/* Left: Contact Info */}
      <div className="lg:col-span-2">
        <h2 className="font-headline text-headline-sm text-on-surface md:text-headline-md">
          Thông tin liên hệ
        </h2>
        <p className="mt-3 text-body-sm leading-relaxed text-on-surface-variant md:text-body-md">
          Liên hệ trực tiếp hoặc để lại thông tin, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
        </p>

        <div className="mt-8 space-y-3">
          {CONTACT_INFO.map((item) => {
            const Icon = item.icon
            const content = (
              <div className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 transition-all duration-300 group-hover:bg-primary/10 group-hover:shadow-ambient-sm">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-label text-label-md tracking-[0.06em] text-on-surface-variant">
                    {item.label}
                  </p>
                  <p className="text-body-sm font-medium text-on-surface">
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
                  className="block rounded-xl p-2.5 -m-2.5 transition-colors duration-300 hover:bg-surface-container-low"
                >
                  {content}
                </a>
              )
            }

            return <div key={item.label} className="p-2.5 -m-2.5">{content}</div>
          })}
        </div>

        {/* Decorative element */}
        <div className="mt-10 hidden rounded-2xl bg-surface-container-low p-5 lg:block">
          <p className="font-headline text-body-lg italic text-primary">
            &ldquo;Mỗi không gian đều bắt đầu từ một cuộc trò chuyện.&rdquo;
          </p>
          <p className="mt-2 font-label text-label-md tracking-[0.06em] text-on-surface-variant">
            — Đội ngũ VietNet Interior
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="lg:col-span-3">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface-container-low p-5 shadow-ambient-sm md:p-8" noValidate>
          {apiError && (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-error-container/30 px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-error" />
              <p className="text-body-sm text-error">{apiError}</p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="name" className={labelClasses}>
                Họ tên <span className="text-error">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className={cn(inputBaseClasses, errors.name && 'ring-2 ring-error/20')}
              />
              {errors.name && (
                <p className="mt-1.5 text-body-sm text-error">{errors.name}</p>
              )}
            </div>

            {/* Phone — bắt buộc */}
            <div>
              <label htmlFor="phone" className={labelClasses}>
                Điện thoại <span className="text-error">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0909 xxx xxx"
                className={cn(inputBaseClasses, errors.phone && 'ring-2 ring-error/20')}
              />
              {errors.phone && (
                <p className="mt-1.5 text-body-sm text-error">{errors.phone}</p>
              )}
            </div>

            {/* Email — tùy chọn */}
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className={cn(inputBaseClasses, errors.email && 'ring-2 ring-error/20')}
              />
              {errors.email && (
                <p className="mt-1.5 text-body-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Project Type */}
            <div>
              <label htmlFor="project_type" className={labelClasses}>
                Loại dự án
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
                Diện tích (m²)
              </label>
              <input
                id="area"
                name="area"
                type="text"
                value={formData.area}
                onChange={handleChange}
                placeholder="VD: 120"
                className={cn(inputBaseClasses, errors.area && 'ring-2 ring-error/20')}
              />
              {errors.area && (
                <p className="mt-1.5 text-body-sm text-error">{errors.area}</p>
              )}
            </div>

            {/* Budget Range */}
            <div>
              <label htmlFor="budget_range" className={labelClasses}>
                Ngân sách dự kiến
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
              Nội dung yêu cầu <span className="text-error">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Mô tả yêu cầu thiết kế, phong cách mong muốn, thời gian dự kiến..."
              className={cn(inputBaseClasses, 'resize-none', errors.message && 'ring-2 ring-error/20')}
            />
            {errors.message && (
              <p className="mt-1.5 text-body-sm text-error">{errors.message}</p>
            )}
          </div>

          {/* Honeypot - hidden from real users */}
          <div className="sr-only" aria-hidden="true">
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
            className="mt-6 w-full gap-2 md:w-auto"
          >
            <Send className="h-4 w-4" />
            Gửi yêu cầu tư vấn
          </Button>
        </form>
      </div>
    </div>
  )
}
