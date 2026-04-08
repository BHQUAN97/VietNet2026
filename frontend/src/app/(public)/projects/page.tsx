'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { CardGridSkeleton } from '@/components/ui/Skeleton'

import { DataStates } from '@/components/shared/DataStates'
import { Pagination } from '@/components/shared/Pagination'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { resolveMediaUrl } from '@/lib/api-url'
import api from '@/lib/api'
import type { Project, Category } from '@/types'

/** Gom cover_image + gallery thanh mang cho CardCarousel */
function buildProjectImages(project: Project): { src: string; alt: string }[] {
  const result: { src: string; alt: string }[] = []
  if (project.cover_image?.preview_url) {
    result.push({ src: resolveMediaUrl(project.cover_image.preview_url), alt: project.cover_image.alt_text || project.title })
  }
  if (project.gallery) {
    for (const item of project.gallery) {
      if (item.media?.preview_url) {
        result.push({ src: resolveMediaUrl(item.media.preview_url), alt: item.caption || item.media.alt_text || project.title })
      }
    }
  }
  return result
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <section className="bg-surface py-[60px] md:py-24">
        <PageContainer>
          <div className="mb-12">
            <div className="skeleton h-3 w-16 mb-3" />
            <div className="skeleton h-8 w-full max-w-80 mb-3" />
            <div className="skeleton h-5 w-full max-w-96" />
          </div>
          <CardGridSkeleton count={6} />
        </PageContainer>
      </section>
    }>
      <ProjectsContent />
    </Suspense>
  )
}

function ProjectsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])

  const currentCategory = searchParams.get('category') || ''

  // Fetch du an voi paginated list hook
  const { items: projects, meta, page, loading, error, goToPage, refresh, isEmpty } =
    usePaginatedList<Project>({
      endpoint: '/projects',
      limit: 12,
      params: { category: currentCategory || undefined },
    })

  const fetchCategories = useCallback(async () => {
    try {
      const res: any = await api.get('/categories/tree?type=project')
      setCategories(res.data || [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function updateParams(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    router.push(`/projects?${sp.toString()}`)
  }

  return (
    <section className="section-surface">
      <PageContainer>
        {/* Page Header — compact */}
        <div className="mb-6">
          <p className="font-label text-label-sm uppercase tracking-[0.08em] text-primary/70">
            Dự án
          </p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h1 className="font-headline text-headline-sm text-gradient-primary md:text-headline-md">
              Dự Án Nội Thất Tiêu Biểu
            </h1>
            {meta && !loading && (
              <span className="shrink-0 font-label text-label-md text-on-surface-variant">
                {meta.total} Dự án
              </span>
            )}
          </div>
          <p className="mt-1.5 max-w-2xl text-body-sm text-on-surface-variant">
            Khám phá các dự án thiết kế nội thất đã hoàn thành bởi đội ngũ VietNet Interior.
          </p>
          <span className="deco-line mt-3" />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => updateParams({ category: '', page: '' })}
              className={`rounded-full px-4 py-2.5 min-h-[44px] font-label text-label-md uppercase tracking-label-wide transition-all duration-300 ${
                !currentCategory
                  ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParams({ category: cat.slug, page: '' })}
                className={`rounded-full px-4 py-2.5 min-h-[44px] font-label text-label-md uppercase tracking-label-wide transition-all duration-300 ${
                  currentCategory === cat.slug
                    ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Data states: loading / error / empty / content */}
        <DataStates
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          onRetry={refresh}
          emptyMessage="Chưa có dự án nào trong danh mục này."
        >
          <div className="card-grid">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="card-premium group overflow-hidden rounded-2xl bg-surface-container-lowest"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                  <CardCarousel
                    images={buildProjectImages(project)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    hoverScale={false}
                  />
                </div>
                <div className="p-5">
                  {project.category && (
                    <p className="font-label text-label-md uppercase tracking-[0.06em] text-primary/60">
                      {project.category.name}
                    </p>
                  )}
                  <h3 className="mt-1.5 font-headline text-title-md text-on-surface transition-colors duration-300 group-hover:text-primary-container md:text-title-lg">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">
                      {project.description}
                    </p>
                  )}
                  {/* Metadata badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {project.location && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-2 py-0.5 text-body-sm text-on-surface-variant">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </span>
                    )}
                    {project.area && (
                      <span className="inline-flex items-center rounded-lg bg-surface-container px-2 py-0.5 text-body-sm text-on-surface-variant">
                        {project.area}
                      </span>
                    )}
                    {project.style && (
                      <span className="inline-flex items-center rounded-lg bg-surface-container px-2 py-0.5 text-body-sm text-on-surface-variant">
                        {project.style}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            meta={meta}
            currentPage={page}
            onPageChange={goToPage}
            variant="numbered"
            maxButtons={5}
          />
        </DataStates>
      </PageContainer>
    </section>
  )
}
