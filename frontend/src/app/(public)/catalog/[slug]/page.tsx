import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { GalleryWithLightbox } from '@/components/ui/GalleryWithLightbox'
import { Button } from '@/components/ui/Button'
import { productJsonLd } from '@/lib/jsonld'
import { sanitizeHtml } from '@/lib/sanitize'
import { tiptapJsonToHtml } from '@/lib/tiptap-html'
import { resolveMediaUrl } from '@/lib/api-url'
import { serverFetch, serverFetchList } from '@/lib/server-fetch'
import { buildDetailMetadata } from '@/lib/seo-helpers'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const SEO_CONFIG = { entityName: 'Sản phẩm', basePath: '/catalog', ogType: 'website' as const }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await serverFetch(`/products/${slug}`, { tags: ['products', `product-${slug}`] })
  return buildDetailMetadata(product, SEO_CONFIG)
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await serverFetch<any>(`/products/${slug}`, { tags: ['products', `product-${slug}`] })
  if (!product) notFound()

  const relatedProducts = product.category?.id
    ? await serverFetchList<any>(`/products?category_id=${product.category.id}&limit=4&status=published`, {
        tags: ['products'],
        excludeId: product.id,
      })
    : []

  const dimensions = (product.dimensions ?? null) as {
    width?: number; height?: number; depth?: number; unit?: string
  } | null

  // Gom cover + images thành gallery items cho GalleryWithLightbox
  const galleryItems: any[] = []
  if (product.cover_image?.preview_url) {
    galleryItems.push({
      id: 'cover',
      caption: null,
      media: {
        preview_url: product.cover_image.preview_url,
        alt_text: product.cover_image.alt_text || product.name,
      },
    })
  }
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.media?.preview_url) {
        galleryItems.push({
          id: img.id,
          caption: img.caption || null,
          media: {
            preview_url: img.media.preview_url,
            alt_text: img.caption || img.media.alt_text || '',
          },
        })
      }
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(productJsonLd(product)).replace(/</g, '\\u003c'),
      }} />

      <section className="bg-surface py-8 md:py-16">
        <PageContainer>
          <Breadcrumb items={[{ label: 'Sản phẩm', href: '/catalog' }, { label: product.name }]} className="mb-6" />

          <Link href="/catalog" className="mb-8 inline-flex items-center gap-2 text-body-md text-on-surface-variant transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Tất cả sản phẩm
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Image Gallery — Instagram style */}
            <div>
              {galleryItems.length > 0 ? (
                <GalleryWithLightbox items={galleryItems} />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-xl bg-surface-container text-on-surface-variant/30">
                  <span className="text-7xl">&#9633;</span>
                </div>
              )}
              {product.is_new && galleryItems.length > 0 && (
                <span className="mt-3 inline-flex rounded-full bg-primary px-4 py-1.5 font-label text-label-md uppercase text-on-primary">New</span>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.category && (
                <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">{product.category.name}</p>
              )}
              <h1 className="mt-2 font-headline text-headline-lg md:text-display-md text-on-surface">{product.name}</h1>

              {product.price_range && (
                <p className="mt-4 font-headline text-headline-md text-primary">{product.price_range}</p>
              )}

              {product.description && (
                <div className="prose mt-6 max-w-none text-on-surface-variant" dangerouslySetInnerHTML={{ __html: sanitizeHtml(tiptapJsonToHtml(product.description)) }} />
              )}

              <div className="mt-8 space-y-4 rounded-xl bg-surface-container-low p-6">
                <h3 className="font-label text-label-lg uppercase tracking-label-wide text-on-surface">Thông số</h3>
                {product.material_type && (
                  <div className="flex justify-between">
                    <span className="text-body-md text-on-surface-variant">Vật liệu</span>
                    <span className="text-body-md text-on-surface">
                      {product.material_type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
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
                      {dimensions.width} x {dimensions.height}{dimensions.depth ? ` x ${dimensions.depth}` : ''} {dimensions.unit || 'mm'}
                    </span>
                  </div>
                )}
              </div>

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
              <h2 className="mb-8 text-center font-headline text-headline-md text-on-surface">Sản phẩm liên quan</h2>
              <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((rp: any) => (
                  <Link key={rp.id} href={`/catalog/${rp.slug}`} className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient-lg">
                    <div className="relative aspect-square overflow-hidden bg-surface-container">
                      {rp.cover_image?.preview_url ? (
                        <Image src={resolveMediaUrl(rp.cover_image.preview_url)} alt={rp.cover_image.alt_text || rp.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-on-surface-variant/30"><span className="text-4xl">&#9633;</span></div>
                      )}
                      {rp.is_new && (
                        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-label text-label-sm uppercase text-on-primary">New</span>
                      )}
                    </div>
                    <div className="p-4">
                      {rp.category && <p className="font-label text-label-sm uppercase tracking-label-wide text-primary-container">{rp.category.name}</p>}
                      <h3 className="mt-1 line-clamp-2 font-headline text-title-md text-on-surface group-hover:text-primary">{rp.name}</h3>
                      {rp.price_range && <p className="mt-2 text-body-sm text-primary">{rp.price_range}</p>}
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
