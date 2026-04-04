'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, ArrowRight, Send, CheckCircle, AlertTriangle } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import type { ContactCtaConfig } from '@/types'

interface Props {
  config: ContactCtaConfig
}

const PROJECT_TYPES = [
  { value: 'residential', label: 'Nhà ở / Căn hộ' },
  { value: 'commercial', label: 'Văn phòng / Thương mại' },
  { value: 'hospitality', label: 'Khách sạn / F&B' },
  { value: 'renovation', label: 'Cải tạo / Sửa chữa' },
]

export function ContactCtaSection({ config }: Props) {
  const showForm = config.show_form !== false

  if (!showForm) {
    return <SimpleCtaSection config={config} />
  }

  return <FullCtaSection config={config} />
}

/* Layout don gian chi co CTA button */
function SimpleCtaSection({ config }: Props) {
  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24 px-4 md:px-8">
      <div className="relative max-w-2xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-headline text-headline-md md:text-headline-lg text-on-primary font-bold">
            {config.title}
          </h2>
          <p className="mt-4 text-body-md md:text-body-lg text-surface-bright/70">
            {config.description}
          </p>
          <Link href={config.cta_link || '/contact'} className="mt-8 inline-block">
            <Button
              variant="secondary"
              size="lg"
              className="group bg-on-primary/90 text-primary shadow-xl hover:bg-on-primary hover:scale-[1.02]"
            >
              {config.cta_text}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* Layout day du voi form tu van */
function FullCtaSection({ config }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    project_type: 'residential',
    message: 'Tôi muốn được tư vấn thiết kế nội thất.',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Validate tat ca input truoc khi goi API
    if (!formData.name.trim()) { setFormError('Vui lòng nhập họ tên.'); return }
    if (formData.name.trim().length < 2) { setFormError('Họ tên cần ít nhất 2 ký tự.'); return }
    if (formData.name.trim().length > 100) { setFormError('Họ tên tối đa 100 ký tự.'); return }
    if (!formData.phone.trim()) { setFormError('Vui lòng nhập số điện thoại.'); return }
    if (!/^[\d\s\-+().]{8,20}$/.test(formData.phone.trim())) { setFormError('Số điện thoại không hợp lệ.'); return }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { setFormError('Email không hợp lệ.'); return }
    if (formData.message.trim().length < 5) { setFormError('Nội dung yêu cầu cần ít nhất 5 ký tự.'); return }
    if (formData.message.trim().length > 2000) { setFormError('Nội dung tối đa 2000 ký tự.'); return }

    setIsSubmitting(true)
    setFormError('')
    try {
      await api.post('/consultations', {
        ...formData,
        email: formData.email.trim() || undefined,
      })
      setIsSuccess(true)
    } catch (err: any) {
      // Hien thi loi chi tiet tu API
      const msg = err?.data?.message || err?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại sau.'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses =
    'w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary-container/50'

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 bg-primary" id="consultation">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
        {/* Left: info */}
        <ScrollReveal className="text-surface-bright">
          <span className="font-label text-label-sm tracking-[0.2em] text-on-primary-container uppercase mb-4 block">
            Bắt Đầu Hành Trình
          </span>
          <h2 className="font-headline text-headline-lg md:text-display-md font-bold mb-8">
            {config.title}
          </h2>
          <p className="text-surface-bright/70 text-body-md md:text-body-lg mb-12 max-w-lg">
            {config.description}
          </p>

          <div className="space-y-8">
            {config.phone && (
              <div className="flex items-start gap-6">
                <div className="bg-surface-bright/10 p-3 rounded-lg backdrop-blur-sm">
                  <Phone className="h-5 w-5 text-surface-bright" />
                </div>
                <div>
                  <p className="font-label text-label-sm tracking-widest text-surface-bright/60 uppercase mb-1">
                    Đường dây trực tiếp
                  </p>
                  <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="break-all text-title-md md:text-title-lg font-headline font-bold text-surface-bright hover:text-on-primary-container transition-colors">
                    {config.phone}
                  </a>
                </div>
              </div>
            )}
            {config.email && (
              <div className="flex items-start gap-6">
                <div className="bg-surface-bright/10 p-3 rounded-lg backdrop-blur-sm">
                  <Mail className="h-5 w-5 text-surface-bright" />
                </div>
                <div>
                  <p className="font-label text-label-sm tracking-widest text-surface-bright/60 uppercase mb-1">
                    Liên hệ qua Email
                  </p>
                  <a href={`mailto:${config.email}`} className="break-all text-title-md md:text-title-lg font-headline font-bold text-surface-bright hover:text-on-primary-container transition-colors">
                    {config.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Right: form */}
        <ScrollReveal delay={0.15}>
          {isSuccess ? (
            <div className="bg-surface rounded-2xl p-8 md:p-10 shadow-2xl flex flex-col items-center justify-center text-center min-h-[400px]">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-headline text-headline-sm text-on-surface">
                Cảm ơn bạn!
              </h3>
              <p className="mt-2 text-body-md text-on-surface-variant max-w-sm">
                Chúng tôi đã nhận yêu cầu và sẽ liên hệ lại trong 24 giờ.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 md:p-10 shadow-2xl space-y-5">
              <div className="space-y-2">
                <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                  Họ tên <span className="text-error">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                    Số điện thoại <span className="text-error">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0909 xxx xxx"
                    required
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                  Loại dự án
                </label>
                <select
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  {PROJECT_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                  Yêu cầu tư vấn
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mô tả yêu cầu thiết kế, phong cách, diện tích..."
                  rows={3}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-body-sm text-error bg-error/10 rounded-xl px-4 py-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Gửi yêu cầu tư vấn
              </Button>
            </form>
          )}
        </ScrollReveal>
      </div>
    </section>
  )
}
