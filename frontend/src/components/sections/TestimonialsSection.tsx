import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Star } from 'lucide-react'
import type { TestimonialsConfig } from '@/types'

interface Props {
  config: TestimonialsConfig
}

export function TestimonialsSection({ config }: Props) {
  return (
    <section className="py-20 md:py-32 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-16 md:mb-20">
          <span className="font-label text-label-sm tracking-[0.2em] text-primary uppercase mb-4 block">
            {config.label}
          </span>
          <h2 className="font-headline text-headline-lg md:text-display-md text-primary font-bold">
            {config.title}
          </h2>
        </ScrollReveal>

        {!config.items || config.items.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-body-md text-on-surface-variant">Chưa có đánh giá nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {config.items.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl shadow-2xl relative">
                  {/* Quote icon decorative */}
                  <span className="absolute top-6 right-6 md:top-8 md:right-8 text-primary/15 text-5xl md:text-6xl font-headline select-none">
                    &ldquo;
                  </span>

                  {/* Stars */}
                  <div className="flex gap-1 mb-6 text-primary">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary" />
                    ))}
                  </div>

                  {/* Quote content */}
                  <p className="text-on-surface-variant text-body-lg md:text-title-lg leading-relaxed italic mb-8">
                    &ldquo;{item.content}&rdquo;
                  </p>

                  {/* Author info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary font-headline font-bold text-title-md">
                      {item.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-body-md">{item.name}</h4>
                      <p className="text-on-surface-variant text-body-sm">{item.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
