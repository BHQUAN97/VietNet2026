import Image from 'next/image'
import { PageContainer } from '@/components/layout/PageContainer'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Quote } from 'lucide-react'
import type { TestimonialsConfig } from '@/types'

interface Props {
  config: TestimonialsConfig
}

export function TestimonialsSection({ config }: Props) {
  return (
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        <ScrollReveal className="mb-10 md:mb-14 text-center">
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            {config.label}
          </p>
          <h2 className="mt-3 font-headline text-headline-md text-on-surface md:text-headline-lg">
            {config.title}
          </h2>
          <span className="deco-line deco-line-center mt-4" />
        </ScrollReveal>

        {!config.items || config.items.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-body-md text-on-surface-variant">Chưa có đánh giá nào.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {config.items.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="card-premium relative rounded-2xl bg-surface-container-low p-6 md:p-8">
                  {/* Quote icon decorative */}
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                    <Quote className="h-4 w-4 text-primary/40" />
                  </div>

                  <p className="text-body-sm leading-relaxed text-on-surface-variant md:text-body-md">
                    &ldquo;{item.content}&rdquo;
                  </p>

                  {/* Divider */}
                  <div className="mt-5 mb-4 h-[1px] bg-gradient-to-r from-outline-variant/30 via-outline-variant/10 to-transparent" />

                  <div className="flex items-center gap-3">
                    {item.avatar_url ? (
                      <Image
                        src={item.avatar_url}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-headline text-title-md text-primary">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-headline text-body-md font-semibold text-on-surface">
                        {item.name}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </PageContainer>
    </section>
  )
}
