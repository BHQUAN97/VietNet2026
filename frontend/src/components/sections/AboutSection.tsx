import { PageContainer } from '@/components/layout/PageContainer'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { AboutConfig } from '@/types'

interface Props {
  config: AboutConfig
}

export function AboutSection({ config }: Props) {
  return (
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            {config.label}
          </p>
          <h2 className="mt-3 font-headline text-headline-md text-on-surface md:text-headline-lg">
            {config.title}
          </h2>
          <span className="deco-line deco-line-center mt-4" />
          <p className="mt-6 text-body-md leading-relaxed text-on-surface-variant md:text-body-lg">
            {config.description}
          </p>
        </ScrollReveal>

        {config.stats && config.stats.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {config.stats.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1} className="text-center">
                <p className="font-headline text-headline-lg text-gradient-primary md:text-display-md">
                  {stat.value}
                </p>
                <p className="mt-1.5 font-label text-label-md uppercase tracking-[0.06em] text-on-surface-variant">
                  {stat.label}
                </p>
              </ScrollReveal>
            ))}
          </div>
        )}
      </PageContainer>
    </section>
  )
}
