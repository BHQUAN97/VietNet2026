import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { GalleryWithLightbox } from '@/components/ui/GalleryWithLightbox'
import { projectJsonLd } from '@/lib/jsonld'
import { sanitizeHtml } from '@/lib/sanitize'
import { ArrowLeft } from 'lucide-react'

import { getServerApiUrl } from '@/lib/api-url'

const API_URL = getServerApiUrl()

async function getProject(slug: string) {
  try {
    const res = await fetch(`${API_URL}/projects/${slug}`, {
      next: { revalidate: 3600, tags: ['projects', `project-${slug}`] },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

async function getRelatedProjects(categoryId: string, excludeId: string) {
  try {
    const res = await fetch(
      `${API_URL}/projects?category_id=${categoryId}&limit=3&status=published`,
      { next: { revalidate: 3600, tags: ['projects'] } },
    )
    if (!res.ok) return []
    const json = await res.json()
    const projects = json.data || []
    return projects.filter((p: any) => p.id !== excludeId)
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Dự án không tồn tại' }

  const imageUrl = project.og_image?.preview_url || project.cover_image?.preview_url || ''

  return {
    title: project.seo_title || project.title,
    description: project.seo_description || project.description,
    alternates: {
      canonical: `https://bhquan.site/projects/${slug}`,
    },
    openGraph: {
      title: project.seo_title || project.title,
      description: project.seo_description || project.description || '',
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo_title || project.title,
      description: project.seo_description || project.description || '',
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const relatedProjects = project.category?.id
    ? await getRelatedProjects(project.category.id, project.id)
    : []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd(project)),
        }}
      />

      <section className="bg-surface py-8 md:py-16">
        <PageContainer>
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Dự án', href: '/projects' },
              { label: project.title },
            ]}
            className="mb-6"
          />

          {/* Back link */}
          <Link
            href="/projects"
            className="mb-8 inline-flex items-center gap-2 text-body-md text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Tất cả dự án
          </Link>

          {/* Header */}
          <div className="mb-8">
            {project.category && (
              <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
                {project.category.name}
              </p>
            )}
            <h1 className="mt-2 font-headline text-display-md text-on-surface md:text-display-lg">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-4 max-w-3xl text-body-lg text-on-surface-variant">
                {project.description}
              </p>
            )}
          </div>

          {/* Project Info */}
          <div className="mb-10 flex flex-wrap gap-8 rounded-xl bg-surface-container-low p-6">
            {project.style && (
              <div>
                <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Phong cách
                </p>
                <p className="mt-1 text-body-md text-on-surface">{project.style}</p>
              </div>
            )}
            {project.area && (
              <div>
                <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Diện tích
                </p>
                <p className="mt-1 text-body-md text-on-surface">{project.area}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Địa điểm
                </p>
                <p className="mt-1 text-body-md text-on-surface">{project.location}</p>
              </div>
            )}
            {project.duration && (
              <div>
                <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Thời gian
                </p>
                <p className="mt-1 text-body-md text-on-surface">{project.duration}</p>
              </div>
            )}
            {project.year_completed && (
              <div>
                <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Năm hoàn thành
                </p>
                <p className="mt-1 text-body-md text-on-surface">{project.year_completed}</p>
              </div>
            )}
            {Array.isArray(project.materials) && project.materials.length > 0 && (
              <div>
                <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                  Vật liệu
                </p>
                <p className="mt-1 text-body-md text-on-surface">
                  {project.materials.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Cover Image */}
          {project.cover_image?.preview_url && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-xl bg-surface-container">
              <Image
                src={project.cover_image.preview_url}
                alt={project.cover_image.alt_text || project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            </div>
          )}

          {/* Content */}
          {project.content && (
            <div
              className="prose prose-lg mx-auto max-w-4xl text-on-surface"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.content) }}
            />
          )}

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-8 font-headline text-headline-md text-on-surface">
                Thư viện hình ảnh
              </h2>
              <GalleryWithLightbox items={project.gallery} />
            </div>
          )}

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-center font-headline text-headline-md text-on-surface">
                Dự án liên quan
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((rp: any) => (
                  <Link
                    key={rp.id}
                    href={`/projects/${rp.slug}`}
                    className="group overflow-hidden rounded-xl bg-surface shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                      {rp.cover_image?.preview_url ? (
                        <Image
                          src={rp.cover_image.preview_url}
                          alt={rp.cover_image.alt_text || rp.title}
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
                      {rp.category && (
                        <p className="font-label text-label-md uppercase tracking-label-wide text-primary-container">
                          {rp.category.name}
                        </p>
                      )}
                      <h3 className="mt-1 font-headline text-title-lg text-on-surface group-hover:text-primary">
                        {rp.title}
                      </h3>
                      {rp.description && (
                        <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">
                          {rp.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </PageContainer>
      </section>
    </>
  )
}
