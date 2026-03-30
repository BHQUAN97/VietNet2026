import Link from 'next/link'
import Image from 'next/image'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { FeaturedProjectsConfig, Project } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

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
    <section className="bg-surface-container-low py-20 md:py-28">
      <PageContainer>
        <div className="mb-12 text-center">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
            {config.label}
          </p>
          <h2 className="mt-3 font-headline text-headline-lg text-on-surface md:text-display-md">
            {config.title}
          </h2>
        </div>
        {projects.length === 0 ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <p className="text-body-lg text-on-surface-variant">Chua co du an noi bat nao.</p>
          </div>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group overflow-hidden rounded-xl bg-surface shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
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
                    <span className="text-4xl">&#9633;</span>
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
              </div>
            </Link>
          ))}
        </div>
        )}
        {config.cta_text && (
          <div className="mt-12 text-center">
            <Link href={config.cta_link || '/projects'}>
              <Button variant="secondary" size="lg">
                {config.cta_text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </PageContainer>
    </section>
  )
}
