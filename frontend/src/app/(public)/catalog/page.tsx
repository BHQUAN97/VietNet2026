import type { Metadata } from 'next'
import { Suspense } from 'react'
import CatalogClient from './CatalogClient'
import { fetchPaginated } from '@/lib/fetch-paginated'
import type { Product } from '@/types'

export const metadata: Metadata = {
  title: 'San pham — VietNet Interior',
  description: 'Danh muc san pham noi that',
  alternates: {
    canonical: 'https://bhquan.site/catalog',
  },
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    material?: string
    [k: string]: string | string[] | undefined
  }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const pageNum = Number.parseInt(typeof sp.page === 'string' ? sp.page : '', 10)
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1
  const material = typeof sp.material === 'string' ? sp.material : ''

  // SSR hydrate chi cho page 1 khong filter — case chinh cho SEO bots.
  const shouldSsrFetch = page === 1 && !material
  const initial = shouldSsrFetch
    ? await fetchPaginated<Product>({
        endpoint: '/products',
        page: 1,
        limit: 12,
        revalidate: 60,
        tags: ['products-list'],
      })
    : null

  return (
    <Suspense fallback={null}>
      <CatalogClient initialData={initial ?? undefined} />
    </Suspense>
  )
}
