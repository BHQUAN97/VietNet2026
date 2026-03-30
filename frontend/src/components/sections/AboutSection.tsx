import { PageContainer } from '@/components/layout/PageContainer'
import type { AboutConfig } from '@/types'

interface Props {
  config: AboutConfig
}

export function AboutSection({ config }: Props) {
  return (
    <section className="bg-surface py-20 md:py-28">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
            {config.label}
          </p>
          <h2 className="mt-3 font-headline text-headline-lg text-on-surface md:text-display-md">
            {config.title}
          </h2>
          <p className="mt-6 text-body-lg text-on-surface-variant">
            {config.description}
          </p>
          {config.stats && config.stats.length > 0 && (
            <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {config.stats.map((stat, i) => (
                <div key={i}>
                  <p className="font-headline text-display-md text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </section>
  )
}
