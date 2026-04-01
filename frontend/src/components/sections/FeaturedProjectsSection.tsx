import Link from 'next/link'
import Image from 'next/image'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ArrowRight } from 'lucide-react'
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

/* Du lieu mau khi chua co API */
const PLACEHOLDER_PROJECTS = [
  {
    slug: '#',
    category: 'Residential / 2023',
    title: 'The Amberwood Estate',
    description: 'A harmonic blend of tropical warmth and Scandinavian minimalism in the heart of Saigon.',
  },
  {
    slug: '#',
    category: 'Commercial / 2024',
    title: 'Zenith Headquarters',
    description: 'Redefining corporate wellness through architectural transparency and natural textures.',
    offset: true,
  },
  {
    slug: '#',
    category: 'Hospitality / 2023',
    title: 'Luna Suite Collection',
    description: 'Bespoke luxury defined by tactile materials and dramatic lighting compositions.',
  },
]

export async function FeaturedProjectsSection({ config }: Props) {
  const projects = await getFeaturedProjects(config.limit || 6)

  return (
    <section className="py-20 md:py-32 bg-surface-container-low px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div>
            <span className="font-label text-label-sm tracking-[0.2em] text-primary uppercase mb-4 block">
              {config.label}
            </span>
            <h2 className="font-headline text-headline-lg md:text-display-md text-primary font-bold">
              {config.title}
            </h2>
          </div>
          {config.cta_text && (
            <Link
              href={config.cta_link || '/projects'}
              className="text-primary font-bold flex items-center gap-2 group hover:gap-4 transition-all"
            >
              {config.cta_text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </ScrollReveal>

        {/* Project grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.1}>
                <Link href={`/projects/${project.slug}`} className="block">
                  <div className={`group relative overflow-hidden rounded-xl bg-surface h-[400px] md:h-[500px] ${index === 1 ? 'md:mt-12' : ''}`}>
                    {project.cover_image?.preview_url ? (
                      <Image
                        src={project.cover_image.preview_url}
                        alt={project.cover_image.alt_text || project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-container/50" />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <p className="text-surface-bright/70 font-label text-label-sm tracking-[0.2em] uppercase mb-2">
                        {project.category?.name || 'Project'} {project.year_completed ? `/ ${project.year_completed}` : ''}
                      </p>
                      <h3 className="text-surface-bright font-headline text-title-lg md:text-headline-sm font-bold mb-4">
                        {project.title}
                      </h3>
                      <p className="text-surface-bright/0 group-hover:text-surface-bright/80 transition-all text-body-sm leading-relaxed duration-500 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          /* Placeholder grid khi chua co du lieu */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {PLACEHOLDER_PROJECTS.map((item, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className={`group relative overflow-hidden rounded-xl h-[400px] md:h-[500px] bg-gradient-to-br from-primary/20 to-primary-container/40 ${item.offset ? 'md:mt-12' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-70" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <p className="text-surface-bright/70 font-label text-label-sm tracking-[0.2em] uppercase mb-2">
                      {item.category}
                    </p>
                    <h3 className="text-surface-bright font-headline text-title-lg md:text-headline-sm font-bold mb-4">
                      {item.title}
                    </h3>
                    <p className="text-surface-bright/60 text-body-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
