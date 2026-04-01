import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ArrowRight } from 'lucide-react'
import type { ContactCtaConfig } from '@/types'

interface Props {
  config: ContactCtaConfig
}

export function ContactCtaSection({ config }: Props) {
  return (
    <section className="relative overflow-hidden bg-primary-container py-16 md:py-24">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-on-primary" />
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-on-primary" />
        <div className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-on-primary" />
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container via-primary/40 to-primary-container" />

      <PageContainer className="relative">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-headline-md text-on-primary md:text-headline-lg">
            {config.title}
          </h2>
          <p className="mt-4 text-body-md text-on-primary/80 md:text-body-lg">
            {config.description}
          </p>
          <Link href={config.cta_link || '/contact'} className="mt-8 inline-block">
            <Button
              variant="secondary"
              size="lg"
              className="group bg-on-primary/90 text-primary-container shadow-ambient-md hover:bg-on-primary hover:text-primary hover:shadow-ambient-lg hover:scale-[1.02]"
            >
              {config.cta_text}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </ScrollReveal>
      </PageContainer>
    </section>
  )
}
