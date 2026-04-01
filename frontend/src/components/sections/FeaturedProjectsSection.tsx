import Link from 'next/link'
import Image from 'next/image'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { FeaturedProjectsConfig, Project } from '@/types'

import { getServerApiUrl } from '@/lib/api-url'

const API_URL = getServerApiUrl()

async function getFeaturedProjects(limit: number): Promise<Project[]> {
  try {
    const res = await fetch(
      `${API_URL}/projects?limit=${limit}&is_featured=true`,
      { next: { revalidate: 60, tags: ['projects'] } },
    )
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

interface Props {
  config: FeaturedProjectsConfig
}

export async function FeaturedProjectsSection({ config }: Props) {
  const projects = await getFeaturedProjects(config.limit || 6)

  return (
    <section className="bg-surface-container-low py-16 md:py-24">
      <PageContainer>
        {/* Section header - compact */}
        <ScrollReveal className="mb-10 md:mb-14 text-center">
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            {config.label}
          </p>
          <h2 className="mt-3 font-headline text-headline-md text-on-surface md:text-headline-lg">
            {config.title}
          </h2>
          <span className="deco-line deco-line-center mt-4" />
        </ScrollReveal>

        {projects.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-body-md text-on-surface-variant">Chưa có dự án nổi bật nào.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.1} className="group">
                <Link
                  href={`/projects/${project.slug}`}
                  className="card-premium block overflow-hidden rounded-2xl bg-surface"
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
                    {/* Hover overlay with arrow */}
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
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
        {config.cta_text && (
          <ScrollReveal className="mt-12 text-center">
            <Link href={config.cta_link || '/projects'}>
              <Button variant="secondary" size="md" className="group">
                {config.cta_text}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </ScrollReveal>
        )}
      </PageContainer>
    </section>
  )
}
