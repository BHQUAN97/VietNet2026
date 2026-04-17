import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { articleJsonLd } from '@/lib/jsonld'
import { sanitizeHtml } from '@/lib/sanitize'
import { tiptapJsonToHtml } from '@/lib/tiptap-html'
import { serverFetch, serverFetchList } from '@/lib/server-fetch'
import { buildDetailMetadata } from '@/lib/seo-helpers'
import { resolveMediaUrl } from '@/lib/api-url'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/date'
import { getServerApiUrl } from '@/lib/api-url'

const SEO_CONFIG = { entityName: 'Bài viết', basePath: '/articles' }

// ISR fallback cho slug chua sinh — non-generated slugs van render on-demand
export const dynamicParams = true

// Build-time: pre-generate top 50 articles (by view_count desc) de toi uu TTFB + SEO
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${getServerApiUrl()}/articles?status=published&limit=50&sort=view_count:desc`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const json = await res.json()
    const items = json?.data?.items ?? json?.items ?? json?.data ?? []
    if (!Array.isArray(items)) return []
    return items
      .filter((a: { slug?: string }) => typeof a?.slug === 'string' && a.slug.length > 0)
      .map((a: { slug: string }) => ({ slug: a.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await serverFetch(`/articles/${slug}`, { tags: ['articles', `article-${slug}`] })
  return buildDetailMetadata(article, SEO_CONFIG)
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await serverFetch<any>(`/articles/${slug}`, { tags: ['articles', `article-${slug}`] })
  if (!article) notFound()

  const related = await serverFetchList<any>(`/articles/${article.id}/related`, { tags: ['articles'] })
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <>
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleJsonLd(article)).replace(/</g, '\\u003c'),
      }} />

      <article className="bg-surface py-8 md:py-16">
        <PageContainer>
          <Breadcrumb items={[{ label: 'Bài viết', href: '/articles' }, { label: article.title }]} className="mb-6" />

          <Link href="/articles" className="mb-8 inline-flex items-center gap-2 text-body-md text-on-surface-variant transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Tất cả bài viết
          </Link>

          {/* Header */}
          <header className="mx-auto max-w-4xl">
            {article.category && (
              <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">{article.category.name}</p>
            )}
            <h1 className="mt-2 font-headline text-headline-lg text-on-surface md:text-display-md lg:text-display-lg">{article.title}</h1>
            {article.excerpt && <p className="mt-4 text-body-lg text-on-surface-variant">{article.excerpt}</p>}
            <div className="mt-4 flex items-center gap-4 text-body-sm text-on-surface-variant/60">
              {article.published_at && (
                <time dateTime={article.published_at}>{formatDate(article.published_at, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              )}
              {article.view_count > 0 && <span>{article.view_count} lượt xem</span>}
            </div>
          </header>

          {/* Cover Image */}
          {article.cover_image?.preview_url && (
            <div className="mx-auto mt-8 max-w-4xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface-container">
                <Image src={resolveMediaUrl(article.cover_image.preview_url)} alt={article.cover_image.alt_text || article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 900px" priority />
              </div>
            </div>
          )}

          {/* Content */}
          {article.content && (
            <div className="prose prose-lg mx-auto mt-10 max-w-4xl text-on-surface" dangerouslySetInnerHTML={{ __html: sanitizeHtml(tiptapJsonToHtml(article.content)) }} />
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-center font-headline text-headline-md text-on-surface">Bài viết liên quan</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item: any) => (
                  <Link key={item.id} href={`/articles/${item.slug}`} className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient-lg">
                    <div className="relative aspect-[16/9] overflow-hidden bg-surface-container">
                      {item.cover_image?.preview_url ? (
                        <Image src={resolveMediaUrl(item.cover_image.preview_url)} alt={item.cover_image.alt_text || item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 25vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-on-surface-variant/30"><span className="text-3xl">&#9633;</span></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-headline text-title-md text-on-surface group-hover:text-primary">{item.title}</h3>
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
