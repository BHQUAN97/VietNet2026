import Image from 'next/image'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import type { AboutConfig } from '@/types'

/* Tach so va suffix tu string nhu "150+", "12", "100%" */
function parseStatValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/)
  if (match) {
    return { target: parseInt(match[1], 10), suffix: match[2] || '' }
  }
  return { target: 0, suffix: value }
}

interface Props {
  config: AboutConfig
}

export function AboutSection({ config }: Props) {
  return (
    <section className="py-20 md:py-32 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* Left column: text + stats */}
        <ScrollReveal className="lg:col-span-5">
          <span className="font-label text-label-sm tracking-[0.2em] text-primary uppercase mb-4 block">
            {config.label}
          </span>
          <h2 className="font-headline text-headline-lg md:text-display-md text-primary font-bold leading-tight mb-8">
            {config.title}
          </h2>
          <p className="text-on-surface-variant text-body-md md:text-body-lg leading-relaxed mb-6">
            {config.description}
          </p>
          {config.quote && (
            <p className="text-on-surface-variant text-body-md md:text-body-lg leading-relaxed mb-8 italic">
              &ldquo;{config.quote}&rdquo;
            </p>
          )}

          {/* Stats */}
          {config.stats && config.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-8 pt-8 bg-surface-container-low/40 rounded-xl p-6 -mx-1">
              {config.stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-headline-lg md:text-display-md font-headline font-bold text-primary">
                    <AnimatedCounter {...parseStatValue(stat.value)} />
                  </p>
                  <p className="font-label text-label-sm tracking-widest text-on-surface-variant uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Right column: 2 staggered images */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.images && config.images.length >= 2 ? (
            <>
              <ScrollReveal delay={0.1} className="pt-12">
                <div className="relative h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={config.images[0]}
                    alt="VietNet Interior - Chất liệu"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="relative h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={config.images[1]}
                    alt="VietNet Interior - Kiến trúc"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </ScrollReveal>
            </>
          ) : (
            /* Placeholder khi chua co anh */
            <>
              <div className="pt-12">
                <div className="h-[320px] md:h-[400px] rounded-2xl bg-surface-container shadow-2xl" />
              </div>
              <div>
                <div className="h-[320px] md:h-[400px] rounded-2xl bg-surface-container-high shadow-2xl" />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
