'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
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
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
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
      setError('Khong the tai du an. Vui long thu lai.')
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
        <div className="mb-12">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
            Du an
          </p>
          <h1 className="mt-3 font-headline text-display-md text-on-surface md:text-display-lg">
            Du an noi that tieu bieu
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            Kham pha cac du an thiet ke noi that da hoan thanh boi doi ngu VietNet Interior.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => updateParams({ category: '', page: '' })}
              className={`rounded-full px-4 py-2 font-label text-label-md uppercase tracking-label-wide transition-colors ${
                !currentCategory
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Tat ca
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParams({ category: cat.slug, page: '' })}
                className={`rounded-full px-4 py-2 font-label text-label-md uppercase tracking-label-wide transition-colors ${
                  currentCategory === cat.slug
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Dang tai">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-body-lg text-error">{error}</p>
            <Button variant="ghost" className="mt-4" onClick={fetchProjects}>
              Thu lai
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && projects.length === 0 && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-body-lg text-on-surface-variant">
              Chua co du an nao trong danh muc nay.
            </p>
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
                  className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                    {project.cover_image?.preview_url ? (
                      <Image
                        src={project.cover_image.preview_url}
                        alt={project.cover_image.alt_text || project.title}
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
                    {project.category && (
                      <p className="font-label text-label-md uppercase tracking-label-wide text-primary-container">
                        {project.category.name}
                      </p>
                    )}
                    <h3 className="mt-1 font-headline text-title-lg text-on-surface group-hover:text-primary">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 text-body-sm text-on-surface-variant/60">
                      {project.style && <span>{project.style}</span>}
                      {project.area && <span>{project.area}</span>}
                      {project.location && <span>{project.location}</span>}
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
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
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
