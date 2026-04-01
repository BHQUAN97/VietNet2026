'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { HeroConfig } from '@/types'

interface Props {
  config: HeroConfig
}

export function HeroSection({ config }: Props) {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {config.bg_image_url ? (
          <Image
            src={config.bg_image_url}
            alt="VietNet Interior"
            fill
            priority
            className="object-cover scale-105"
            sizes="100vw"
          />
        ) : (
          /* Placeholder gradient khi chua co anh */
          <div className="h-full w-full bg-gradient-to-br from-primary via-primary-container to-primary" />
        )}
        {/* Overlay: tint + gradient tu duoi len */}
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
      </div>

      {/* Content — mobile: bottom-aligned, desktop: centered */}
      <div className="relative z-10 w-full max-w-4xl px-6 md:px-4 md:text-center absolute bottom-0 left-0 pb-8 md:static md:pb-0">
        {/* Label badge — hidden on mobile, visible on desktop */}
        <span className="hidden md:inline-block font-label text-label-sm tracking-[0.3em] text-surface-bright uppercase mb-6 bg-primary-container/30 backdrop-blur-md px-4 py-2 rounded-full outline outline-1 outline-on-primary/10">
          {config.label}
        </span>
        {/* Mobile label */}
        <p className="md:hidden font-label text-surface-bright/80 tracking-[0.2em] mb-4 text-label-sm uppercase">
          {config.label}
        </p>

        {/* Main heading */}
        <h1 className="font-headline text-[2.5rem] md:text-[4.5rem] lg:text-[5.5rem] text-surface-bright font-bold leading-[1.1] mb-6 md:mb-8 tracking-tight">
          {config.title}
        </h1>

        {/* Subtitle — hidden on mobile for cleaner look */}
        <p className="hidden md:block font-body text-body-md md:text-body-lg text-surface-bright/90 max-w-2xl mx-auto mb-10 leading-relaxed">
          {config.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-center gap-4 md:gap-6">
          {config.cta_primary_text && (
            <Link
              href={config.cta_primary_link || '/projects'}
              className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
            >
              {config.cta_primary_text}
              <ArrowRight className="h-4 w-4 md:hidden" />
            </Link>
          )}
          {config.cta_secondary_text && (
            <Link
              href={config.cta_secondary_link || '/catalog'}
              className="hidden md:flex text-surface-bright font-semibold items-center gap-2 group underline-offset-8 hover:underline decoration-primary-container"
            >
              {config.cta_secondary_text}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
