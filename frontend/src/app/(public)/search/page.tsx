'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'
import api from '@/lib/api'

interface SearchResult {
  id: string
  type: 'project' | 'product' | 'article'
  title: string
  slug: string
  description: string | null
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

const TYPE_LABELS: Record<string, string> = {
  project: 'Du an',
  product: 'San pham',
  article: 'Bai viet',
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
  const [results, setResults] = useState<SearchResult[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '')

  const query = searchParams.get('q') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const doSearch = useCallback(async () => {
    if (!query) {
      setResults([])
      setMeta(null)
      return
    }

    setLoading(true)
    try {
      const res: any = await api.get('/search', {
        params: { q: query, page: String(currentPage), limit: '12' },
      })
      setResults(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, currentPage])

  useEffect(() => {
    doSearch()
  }, [doSearch])

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
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        <div className="mb-12">
          <h1 className="font-headline text-display-md text-on-surface md:text-display-lg">
            Tim kiem
          </h1>
          <p className="mt-4 text-body-lg text-on-surface-variant">
            Tim kiem du an, san pham va bai viet.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhap tu khoa tim kiem..."
              className="w-full rounded-xl bg-surface-container py-4 pl-12 pr-4 text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Results */}
        {!loading && query && results.length === 0 && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-body-lg text-on-surface-variant">
              Khong tim thay ket qua cho &quot;{query}&quot;
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="mb-6 text-body-md text-on-surface-variant">
              Tim thay {meta?.total || results.length} ket qua cho &quot;{query}&quot;
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

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    router.push(`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`)
                  }
                >
                  Truoc
                </Button>
                <span className="px-4 text-body-md text-on-surface-variant">
                  {currentPage} / {meta.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage >= meta.totalPages}
                  onClick={() =>
                    router.push(`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`)
                  }
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
