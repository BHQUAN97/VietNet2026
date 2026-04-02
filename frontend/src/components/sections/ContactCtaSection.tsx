'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, ArrowRight, Send, CheckCircle } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import type { ContactCtaConfig } from '@/types'

interface Props {
  config: ContactCtaConfig
}

const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential Design' },
  { value: 'commercial', label: 'Commercial Office' },
  { value: 'hospitality', label: 'Hospitality / Retail' },
  { value: 'renovation', label: 'Renovation' },
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
    email: '',
    project_type: 'residential',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formError, setFormError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return

    setIsSubmitting(true)
    setFormError('')
    try {
      await api.post('/consultations', formData)
      setIsSuccess(true)
    } catch {
      setFormError('Gửi yêu cầu thất bại. Vui lòng thử lại sau.')
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
            Begin the Journey
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
                    Direct Line
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
                    Email Inquiry
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
            <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 md:p-10 shadow-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyen Van A"
                    required
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                  Project Type
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
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your space..."
                  rows={4}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {formError && (
                <p className="text-body-sm text-error bg-error/10 rounded-xl px-4 py-2">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Schedule Consultation
              </Button>
            </form>
          )}
        </ScrollReveal>
      </div>
    </section>
  )
}
