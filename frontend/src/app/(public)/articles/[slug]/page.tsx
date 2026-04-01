import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { articleJsonLd } from '@/lib/jsonld'
import { sanitizeHtml } from '@/lib/sanitize'
import { ArrowLeft } from 'lucide-react'

import { getServerApiUrl } from '@/lib/api-url'

const API_URL = getServerApiUrl()

async function getArticle(slug: string) {
  try {
    const res = await fetch(`${API_URL}/articles/${slug}`, {
      next: { revalidate: 3600, tags: ['articles', `article-${slug}`] },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

async function getRelatedArticles(id: string) {
  try {
    const res = await fetch(`${API_URL}/articles/${id}/related`, {
      next: { revalidate: 3600, tags: ['articles'] },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Bài viết không tồn tại' }

  const imageUrl = article.og_image?.preview_url || article.cover_image?.preview_url || ''

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    alternates: {
      canonical: `https://bhquan.site/articles/${slug}`,
    },
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || '',
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'article',
      publishedTime: article.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || '',
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article.id)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article)),
        }}
      />

      <article className="bg-surface py-8 md:py-16">
        <PageContainer>
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Bài viết', href: '/articles' },
              { label: article.title },
            ]}
            className="mb-6"
          />

          {/* Back link */}
          <Link
            href="/articles"
            className="mb-8 inline-flex items-center gap-2 text-body-md text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Tất cả bài viết
          </Link>

          {/* Header */}
          <header className="mx-auto max-w-4xl">
            {article.category && (
              <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
                {article.category.name}
              </p>
            )}
            <h1 className="mt-2 font-headline text-display-md text-on-surface md:text-display-lg">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-4 text-body-lg text-on-surface-variant">
                {article.excerpt}
              </p>
            )}
            <div className="mt-4 flex items-center gap-4 text-body-sm text-on-surface-variant/60">
              {article.published_at && (
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
              {article.view_count > 0 && (
                <span>{article.view_count} lượt xem</span>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {article.cover_image?.preview_url && (
            <div className="mx-auto mt-8 max-w-4xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface-container">
                <Image
                  src={article.cover_image.preview_url}
                  alt={article.cover_image.alt_text || article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority
                />
              </div>
            </div>
          )}

          {/* Content */}
          {article.content && (
            <div
              className="prose prose-lg mx-auto mt-10 max-w-4xl text-on-surface"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
            />
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-center font-headline text-headline-md text-on-surface">
                Bài viết liên quan
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.slug}`}
                    className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-surface-container">
                      {item.cover_image?.preview_url ? (
                        <Image
                          src={item.cover_image.preview_url}
                          alt={item.cover_image.alt_text || item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-on-surface-variant/30">
                          <span className="text-3xl">&#9633;</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-headline text-title-md text-on-surface group-hover:text-primary">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </PageContainer>
      </article>
    </>
  )
}
