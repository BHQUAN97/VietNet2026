'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataStates } from '@/components/shared/DataStates'
import { Pagination } from '@/components/shared/Pagination'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { formatDate } from '@/lib/date'
import type { Article } from '@/types'

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <ArticlesContent />
    </Suspense>
  )
}

function ArticlesContent() {
  const { items, meta, page, loading, error, goToPage, refresh, isEmpty } =
    usePaginatedList<Article>({ endpoint: '/articles', limit: 9 })

  return (
    <section className="section-surface">
      <PageContainer>
        <PageHeader
          label="Blog"
          title="Tin Tức & Cảm Hứng"
          description="Cập nhật xu hướng thiết kế nội thất và chia sẻ cảm hứng không gian sống."
        />

        <DataStates
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refresh}
          emptyMessage="Chưa có bài viết nào."
        >
          <div className="card-grid">
            {items.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
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
                      <span className="text-5xl">&#9633;</span>
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
                    <p className="mt-2 line-clamp-3 text-body-sm text-on-surface-variant">
                      {article.excerpt}
                    </p>
                  )}
                  {article.published_at && (
                    <p className="mt-3 text-body-sm text-on-surface-variant/60">
                      {formatDate(article.published_at)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <Pagination meta={meta} currentPage={page} onPageChange={goToPage} />
        </DataStates>
      </PageContainer>
    </section>
  )
}
