import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { HeroConfig } from '@/types'

interface Props {
  config: HeroConfig
}

export function HeroSection({ config }: Props) {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center bg-surface">
      {config.bg_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.bg_image_url})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/50 to-surface" />
      <PageContainer className="relative z-10 text-center">
        <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
          {config.label}
        </p>
        <h1 className="mt-4 font-headline text-display-lg text-primary md:text-[4.5rem]">
          {config.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-body-lg text-on-surface-variant">
          {config.subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {config.cta_primary_text && (
            <Link href={config.cta_primary_link || '/projects'}>
              <Button size="lg">{config.cta_primary_text}</Button>
            </Link>
          )}
          {config.cta_secondary_text && (
            <Link href={config.cta_secondary_link || '/contact'}>
              <Button variant="ghost" size="lg">
                {config.cta_secondary_text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </PageContainer>
    </section>
  )
}
