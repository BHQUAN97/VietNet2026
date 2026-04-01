'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  category: { id: string; name: string; slug: string } | null
  cover_image: { preview_url: string; alt_text: string } | null
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <ArticlesContent />
    </Suspense>
  )
}

function ArticlesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res: any = await api.get('/articles', {
        params: { page: String(currentPage), limit: '9' },
      })
      setArticles(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Không thể tải bài viết. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return (
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        <div className="mb-12">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
            Blog
          </p>
          <h1 className="mt-3 font-headline text-display-md text-on-surface md:text-display-lg">
            Tin tức & Cảm hứng
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            Cập nhật xu hướng thiết kế nội thất và chia sẻ cảm hứng không gian sống.
          </p>
        </div>

        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Đang tải">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-body-lg text-error">{error}</p>
            <Button variant="ghost" className="mt-4" onClick={fetchArticles}>
              Thử lại
            </Button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-body-lg text-on-surface-variant">Chưa có bài viết nào.</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
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
                        {new Date(article.published_at).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => router.push(`/articles?page=${currentPage - 1}`)}
                >
                  Trước
                </Button>
                <span className="px-4 text-body-md text-on-surface-variant">
                  {currentPage} / {meta.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage >= meta.totalPages}
                  onClick={() => router.push(`/articles?page=${currentPage + 1}`)}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </section>
  )
}
