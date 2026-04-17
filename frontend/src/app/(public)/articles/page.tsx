import type { Metadata } from 'next'
import { Suspense } from 'react'
import ArticlesClient from './ArticlesClient'
import { fetchPaginated } from '@/lib/fetch-paginated'
import type { Article } from '@/types'

export const metadata: Metadata = {
  title: 'Bai viet — VietNet Interior',
  description: 'Kien thuc va cam hung thiet ke noi that tu VietNet',
  alternates: {
    canonical: 'https://bhquan.site/articles',
  },
}

interface PageProps {
  searchParams: Promise<{ page?: string; [k: string]: string | string[] | undefined }>
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const pageNum = Number.parseInt(typeof sp.page === 'string' ? sp.page : '', 10)
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1

  // Chi SSR hydrate khi khong filter va o page 1 — case chinh cho SEO bots.
  const shouldSsrFetch = page === 1
  const initial = shouldSsrFetch
    ? await fetchPaginated<Article>({
        endpoint: '/articles',
        page: 1,
        limit: 9,
        revalidate: 60,
        tags: ['articles-list'],
      })
    : null

  return (
    <Suspense fallback={null}>
      <ArticlesClient initialData={initial ?? undefined} />
    </Suspense>
  )
}
