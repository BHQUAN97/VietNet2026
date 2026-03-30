import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { ContactCtaConfig } from '@/types'

interface Props {
  config: ContactCtaConfig
}

export function ContactCtaSection({ config }: Props) {
  return (
    <section className="bg-primary py-20 md:py-28">
      <PageContainer>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-headline-lg text-on-primary md:text-display-md">
            {config.title}
          </h2>
          <p className="mt-4 text-body-lg text-on-primary/80">
            {config.description}
          </p>
          <Link href={config.cta_link || '/contact'} className="mt-8 inline-block">
            <Button
              variant="secondary"
              size="lg"
              className="bg-on-primary text-primary hover:bg-on-primary/90 hover:text-primary"
            >
              {config.cta_text}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </PageContainer>
    </section>
  )
}
