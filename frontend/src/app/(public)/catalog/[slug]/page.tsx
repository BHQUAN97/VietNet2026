import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { productJsonLd } from '@/lib/jsonld'
import { sanitizeHtml } from '@/lib/sanitize'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { getServerApiUrl } from '@/lib/api-url'

const API_URL = getServerApiUrl()

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 3600, tags: ['products', `product-${slug}`] },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  try {
    const res = await fetch(
      `${API_URL}/products?category_id=${categoryId}&limit=4&status=published`,
      { next: { revalidate: 3600, tags: ['products'] } },
    )
    if (!res.ok) return []
    const json = await res.json()
    const products = json.data || []
    return products.filter((p: any) => p.id !== excludeId)
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
  const product = await getProduct(slug)
  if (!product) return { title: 'Sản phẩm không tồn tại' }

  const imageUrl = product.og_image?.preview_url || product.cover_image?.preview_url || ''

  return {
    title: product.seo_title || product.name,
    description: product.seo_description || product.description,
    alternates: {
      canonical: `https://bhquan.site/catalog/${slug}`,
    },
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.description || '',
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seo_title || product.name,
      description: product.seo_description || product.description || '',
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const relatedProducts = product.category?.id
    ? await getRelatedProducts(product.category.id, product.id)
    : []

  const dimensions = (product.dimensions ?? null) as {
    width?: number
    height?: number
    depth?: number
    unit?: string
  } | null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />

      <section className="bg-surface py-8 md:py-16">
        <PageContainer>
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Sản phẩm', href: '/catalog' },
              { label: product.name },
            ]}
            className="mb-6"
          />

          {/* Back link */}
          <Link
            href="/catalog"
            className="mb-8 inline-flex items-center gap-2 text-body-md text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Tất cả sản phẩm
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-container">
                {product.cover_image?.preview_url ? (
                  <Image
                    src={product.cover_image.preview_url}
                    alt={product.cover_image.alt_text || product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-on-surface-variant/30">
                    <span className="text-7xl">&#9633;</span>
                  </div>
                )}
                {product.is_new && (
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-4 py-1.5 font-label text-label-md uppercase text-on-primary">
                    New
                  </span>
                )}
              </div>

              {/* Additional images */}
              {product.images && product.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {product.images.map((img: any) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-surface-container"
                    >
                      {img.media?.preview_url && (
                        <Image
                          src={img.media.preview_url}
                          alt={img.caption || img.media.alt_text || ''}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.category && (
                <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
                  {product.category.name}
                </p>
              )}
              <h1 className="mt-2 font-headline text-display-md text-on-surface">
                {product.name}
              </h1>

              {product.price_range && (
                <p className="mt-4 font-headline text-headline-md text-primary">
                  {product.price_range}
                </p>
              )}

              {product.description && (
                <div
                  className="prose mt-6 max-w-none text-on-surface-variant"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
                />
              )}

              {/* Specs */}
              <div className="mt-8 space-y-4 rounded-xl bg-surface-container-low p-6">
                <h3 className="font-label text-label-lg uppercase tracking-label-wide text-on-surface">
                  Thông số
                </h3>
                {product.material_type && (
                  <div className="flex justify-between">
                    <span className="text-body-md text-on-surface-variant">Vật liệu</span>
                    <span className="text-body-md text-on-surface">{product.material_type}</span>
                  </div>
                )}
                {product.finish && (
                  <div className="flex justify-between">
                    <span className="text-body-md text-on-surface-variant">Hoàn thiện</span>
                    <span className="text-body-md text-on-surface">{product.finish}</span>
                  </div>
                )}
                {dimensions && (
                  <div className="flex justify-between">
                    <span className="text-body-md text-on-surface-variant">Kích thước</span>
                    <span className="text-body-md text-on-surface">
                      {dimensions.width} x {dimensions.height}
                      {dimensions.depth ? ` x ${dimensions.depth}` : ''}{' '}
                      {dimensions.unit || 'mm'}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Link href="/contact" className="mt-8 inline-block">
                <Button size="lg">
                  Liên hệ tư vấn
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-center font-headline text-headline-md text-on-surface">
                Sản phẩm liên quan
              </h2>
              <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((rp: any) => (
                  <Link
                    key={rp.id}
                    href={`/catalog/${rp.slug}`}
                    className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-surface-container">
                      {rp.cover_image?.preview_url ? (
                        <Image
                          src={rp.cover_image.preview_url}
                          alt={rp.cover_image.alt_text || rp.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-on-surface-variant/30">
                          <span className="text-4xl">&#9633;</span>
                        </div>
                      )}
                      {rp.is_new && (
                        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-label text-label-sm uppercase text-on-primary">
                          New
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      {rp.category && (
                        <p className="font-label text-label-sm uppercase tracking-label-wide text-primary-container">
                          {rp.category.name}
                        </p>
                      )}
                      <h3 className="mt-1 line-clamp-2 font-headline text-title-md text-on-surface group-hover:text-primary">
                        {rp.name}
                      </h3>
                      {rp.price_range && (
                        <p className="mt-2 text-body-sm text-primary">
                          {rp.price_range}
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
