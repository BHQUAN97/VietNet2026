'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { ArrowUpRight, MapPin } from 'lucide-react'
import api from '@/lib/api'

interface Category {
  id: string
  name: string
  slug: string
}

interface Project {
  id: string
  title: string
  slug: string
  description: string | null
  category: Category | null
  cover_image: { preview_url: string; alt_text: string } | null
  style: string | null
  area: string | null
  location: string | null
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <section className="bg-surface py-16 md:py-24">
        <PageContainer>
          <div className="mb-12">
            <div className="skeleton h-3 w-16 mb-3" />
            <div className="skeleton h-8 w-80 mb-3" />
            <div className="skeleton h-5 w-96" />
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
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentCategory = searchParams.get('category') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const fetchCategories = useCallback(async () => {
    try {
      const res: any = await api.get('/categories/tree?type=project')
      setCategories(res.data || [])
    } catch {
      // silent
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {
        page: String(currentPage),
        limit: '12',
      }
      if (currentCategory) params.category = currentCategory

      const res: any = await api.get('/projects', { params })
      setProjects(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Không thể tải dự án. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentCategory])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  function updateParams(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    router.push(`/projects?${sp.toString()}`)
  }

  return (
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        {/* Page Header */}
        <div className="mb-12">
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            Dự án
          </p>
          <h1 className="mt-3 font-headline text-headline-lg text-gradient-primary md:text-display-md">
            Dự án nội thất tiêu biểu
          </h1>
          <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">
            Khám phá các dự án thiết kế nội thất đã hoàn thành bởi đội ngũ VietNet Interior.
          </p>
          <span className="deco-line mt-5" />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => updateParams({ category: '', page: '' })}
              className={`rounded-full px-4 py-2 font-label text-label-md uppercase tracking-label-wide transition-all duration-300 ${
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
                className={`rounded-full px-4 py-2 font-label text-label-md uppercase tracking-label-wide transition-all duration-300 ${
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

        {/* Loading */}
        {loading && <CardGridSkeleton count={6} />}

        {/* Error */}
        {error && !loading && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-error-container/30 p-10">
              <p className="text-body-md text-error">{error}</p>
              <Button variant="ghost" className="mt-5" onClick={fetchProjects}>
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && projects.length === 0 && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-surface-container-high" />
              <p className="text-body-md text-on-surface-variant">
                Chưa có dự án nào trong danh mục này.
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && projects.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="card-premium group overflow-hidden rounded-2xl bg-surface-container-lowest"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                    {project.cover_image?.preview_url ? (
                      <Image
                        src={project.cover_image.preview_url}
                        alt={project.cover_image.alt_text || project.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-surface-container">
                        <div className="h-12 w-12 rounded-lg bg-surface-container-high" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-on-surface/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="m-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-primary shadow-ambient-sm transition-transform duration-300 group-hover:scale-110">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
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
            {meta && meta.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                  className="rounded-xl"
                >
                  Trước
                </Button>
                {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => updateParams({ page: String(page) })}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl font-label text-label-md transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage >= meta.totalPages}
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                  className="rounded-xl"
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
