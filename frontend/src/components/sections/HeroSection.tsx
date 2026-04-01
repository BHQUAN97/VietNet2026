'use client'

import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { ArrowRight, ChevronDown } from 'lucide-react'
import type { HeroConfig } from '@/types'

interface Props {
  config: HeroConfig
}

export function HeroSection({ config }: Props) {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-surface">
      {/* Background image with subtle zoom animation */}
      {config.bg_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center animate-subtle-zoom"
          style={{ backgroundImage: `url(${config.bg_image_url})` }}
        />
      )}

      {/* Multi-layer gradient overlay cho độ sâu */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-surface/30 to-surface" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface/40 via-transparent to-surface/40" />

      {/* Decorative elements */}
      <div className="absolute left-8 top-1/4 hidden h-32 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent lg:block" />
      <div className="absolute right-8 top-1/3 hidden h-24 w-[1px] bg-gradient-to-b from-transparent via-primary/15 to-transparent lg:block" />

      {/* Content */}
      <PageContainer className="relative z-10 text-center">
        {/* Label with decorative lines */}
        <div className="flex items-center justify-center gap-4 opacity-0 animate-hero-reveal" style={{ animationDelay: '0.1s' }}>
          <span className="hidden h-[1px] w-8 bg-primary/30 sm:block" />
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            {config.label}
          </p>
          <span className="hidden h-[1px] w-8 bg-primary/30 sm:block" />
        </div>

        {/* Main heading with gradient text */}
        <h1
          className="mt-6 font-headline text-display-lg text-gradient-primary opacity-0 animate-hero-reveal md:text-[4.5rem] lg:text-[5.5rem]"
          style={{ animationDelay: '0.25s' }}
        >
          {config.title}
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-6 max-w-2xl text-body-md text-on-surface-variant opacity-0 animate-hero-reveal md:text-body-lg"
          style={{ animationDelay: '0.4s' }}
        >
          {config.subtitle}
        </p>

        {/* CTA Buttons */}
        <div
          className="mt-10 flex flex-col items-center gap-4 opacity-0 animate-hero-reveal sm:flex-row sm:justify-center"
          style={{ animationDelay: '0.55s' }}
        >
          {config.cta_primary_text && (
            <Link href={config.cta_primary_link || '/projects'}>
              <Button size="lg" className="group">
                {config.cta_primary_text}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
          {config.cta_secondary_text && (
            <Link href={config.cta_secondary_link || '/contact'}>
              <Button variant="ghost" size="lg" className="group">
                {config.cta_secondary_text}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>
      </PageContainer>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight - 72, behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 text-on-surface-variant/50 transition-colors duration-300 hover:text-primary"
          aria-label="Cuộn xuống"
        >
          <span className="font-label text-[0.6rem] uppercase tracking-[0.1em]">Khám phá</span>
          <ChevronDown className="h-4 w-4 animate-float" />
        </button>
      </div>
    </section>
  )
}
