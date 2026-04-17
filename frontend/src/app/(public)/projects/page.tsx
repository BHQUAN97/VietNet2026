import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProjectsClient from './ProjectsClient'
import { fetchPaginated } from '@/lib/fetch-paginated'
import type { Project } from '@/types'

export const metadata: Metadata = {
  title: 'Du an — VietNet Interior',
  description: 'Bo suu tap du an noi that cao cap',
  alternates: {
    canonical: 'https://bhquan.site/projects',
  },
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    [k: string]: string | string[] | undefined
  }>
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const pageNum = Number.parseInt(typeof sp.page === 'string' ? sp.page : '', 10)
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1
  const category = typeof sp.category === 'string' ? sp.category : ''

  // SSR hydrate chi cho page 1 khong filter — case chinh cho SEO bots.
  // Cac filter / page > 1 van fallback sang CSR fetch.
  const shouldSsrFetch = page === 1 && !category
  const initial = shouldSsrFetch
    ? await fetchPaginated<Project>({
        endpoint: '/projects',
        page: 1,
        limit: 12,
        revalidate: 60,
        tags: ['projects-list'],
      })
    : null

  return (
    <Suspense fallback={null}>
      <ProjectsClient initialData={initial ?? undefined} />
    </Suspense>
  )
}
