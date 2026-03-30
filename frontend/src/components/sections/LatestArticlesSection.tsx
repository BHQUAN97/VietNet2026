import Link from 'next/link'
import Image from 'next/image'
import { PageContainer } from '@/components/layout/PageContainer'
import type { LatestArticlesConfig, Article } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

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
    <section className="bg-surface-container-low py-20 md:py-28">
      <PageContainer>
        <div className="mb-12 text-center">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
            {config.label}
          </p>
          <h2 className="mt-3 font-headline text-headline-lg text-on-surface md:text-display-md">
            {config.title}
          </h2>
        </div>
        {articles.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-body-lg text-on-surface-variant">Chua co bai viet nao.</p>
          </div>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group overflow-hidden rounded-xl bg-surface shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-container">
                {article.cover_image?.preview_url ? (
                  <Image
                    src={article.cover_image.preview_url}
                    alt={article.cover_image.alt_text || article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-on-surface-variant/30">
                    <span className="text-4xl">&#9633;</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                {article.category && (
                  <p className="font-label text-label-md uppercase tracking-label-wide text-primary-container">
                    {article.category.name}
                  </p>
                )}
                <h3 className="mt-1 font-headline text-title-lg text-on-surface group-hover:text-primary">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">
                    {article.excerpt}
                  </p>
                )}
                {article.published_at && (
                  <p className="mt-3 text-body-sm text-on-surface-variant/60">
                    {new Date(article.published_at).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        )}
      </PageContainer>
    </section>
  )
}
