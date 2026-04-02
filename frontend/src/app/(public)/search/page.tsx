'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataStates } from '@/components/shared/DataStates'
import { Pagination } from '@/components/shared/Pagination'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { Search } from 'lucide-react'
import type { SearchResult } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  project: 'Dự án',
  product: 'Sản phẩm',
  article: 'Bài viết',
}

const TYPE_PATHS: Record<string, string> = {
  project: '/projects',
  product: '/catalog',
  article: '/articles',
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)

  const { items: results, meta, page, loading, error, goToPage, refresh, isEmpty } =
    usePaginatedList<SearchResult>({
      endpoint: '/search',
      limit: 12,
      params: { q: query || undefined },
      autoFetch: !!query,
    })

  // Dong bo input voi URL query param
  useEffect(() => {
    setInputValue(query)
  }, [query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`)
    }
  }

  return (
    <section className="section-surface">
      <PageContainer>
        <PageHeader
          label="Tìm kiếm"
          title="Tìm Kiếm"
          description="Tìm kiếm dự án, sản phẩm và bài viết."
        />

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="w-full rounded-xl bg-surface-container py-4 pl-12 pr-4 text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        {/* Chi render DataStates khi co query */}
        {query ? (
          <DataStates
            loading={loading}
            error={error}
            isEmpty={isEmpty}
            onRetry={refresh}
            emptyMessage={`Không tìm thấy kết quả cho "${query}"`}
            minHeight="min-h-[30vh]"
          >
            <p className="mb-6 text-body-md text-on-surface-variant">
              Tìm thấy {meta?.total || results.length} kết quả cho &quot;{query}&quot;
            </p>
            <div className="space-y-4">
              {results.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`${TYPE_PATHS[item.type]}/${item.slug}`}
                  className="block rounded-xl bg-surface-container-lowest p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 rounded-full bg-primary-fixed px-3 py-1 font-label text-label-sm uppercase text-on-primary-fixed">
                      {TYPE_LABELS[item.type]}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-headline text-title-lg text-on-surface">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-body-md text-on-surface-variant">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination meta={meta} currentPage={page} onPageChange={goToPage} variant="simple" />
          </DataStates>
        ) : null}
      </PageContainer>
    </section>
  )
}
