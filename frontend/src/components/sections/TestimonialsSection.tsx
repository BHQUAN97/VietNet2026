import Image from 'next/image'
import { PageContainer } from '@/components/layout/PageContainer'
import type { TestimonialsConfig } from '@/types'

interface Props {
  config: TestimonialsConfig
}

export function TestimonialsSection({ config }: Props) {
  return (
    <section className="bg-surface py-20 md:py-28">
      <PageContainer>
        <div className="mb-12 text-center">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
            {config.label}
          </p>
          <h2 className="mt-3 font-headline text-headline-lg text-on-surface md:text-display-md">
            {config.title}
          </h2>
        </div>
        {!config.items || config.items.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-body-lg text-on-surface-variant">Chua co danh gia nao.</p>
          </div>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {config.items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface-container-low p-6"
            >
              <p className="text-body-md text-on-surface-variant italic">
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                {item.avatar_url ? (
                  <Image
                    src={item.avatar_url}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container font-label text-label-lg">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-label text-label-lg text-on-surface">
                    {item.name}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </PageContainer>
    </section>
  )
}
