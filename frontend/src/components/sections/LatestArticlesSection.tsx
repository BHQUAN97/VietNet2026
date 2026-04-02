import Link from 'next/link'
import Image from 'next/image'
import { PageContainer } from '@/components/layout/PageContainer'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ArrowUpRight } from 'lucide-react'
import type { LatestArticlesConfig, Article } from '@/types'
import { formatDate } from '@/lib/date'

import { getServerApiUrl } from '@/lib/api-url'

const API_URL = getServerApiUrl()

async function getLatestArticles(limit: number): Promise<Article[]> {
  try {
    const res = await fetch(`${API_URL}/articles?limit=${limit}`, {
      next: { revalidate: 60, tags: ['articles'] },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

interface Props {
  config: LatestArticlesConfig
}

export async function LatestArticlesSection({ config }: Props) {
  const articles = await getLatestArticles(config.limit || 3)

  return (
    <section className="bg-surface-container-low py-16 md:py-24">
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

        {articles.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-body-md text-on-surface-variant">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <div className="card-grid">
            {articles.map((article, index) => (
              <ScrollReveal key={article.id} delay={index * 0.1} className="group">
                <Link
                  href={`/articles/${article.slug}`}
                  className="card-premium block overflow-hidden rounded-2xl bg-surface"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-container">
                    {article.cover_image?.preview_url ? (
                      <Image
                        src={article.cover_image.preview_url}
                        alt={article.cover_image.alt_text || article.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-surface-container">
                        <div className="h-12 w-12 rounded-lg bg-surface-container-high" />
                      </div>
                    )}
                    {/* Date badge */}
                    {article.published_at && (
                      <div className="absolute left-3 top-3 rounded-lg bg-surface/90 px-2.5 py-1 shadow-ambient-sm backdrop-blur-sm">
                        <p className="font-label text-label-sm text-on-surface">
                          {formatDate(article.published_at)}
                        </p>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-on-surface/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="m-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-primary shadow-ambient-sm transition-transform duration-300 group-hover:scale-110">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {article.category && (
                      <p className="font-label text-label-md uppercase tracking-[0.06em] text-primary/60">
                        {article.category.name}
                      </p>
                    )}
                    <h3 className="mt-1.5 font-headline text-title-md text-on-surface transition-colors duration-300 group-hover:text-primary-container md:text-title-lg">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </PageContainer>
    </section>
  )
}
