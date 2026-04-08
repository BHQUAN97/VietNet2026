'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { DataStates } from '@/components/shared/DataStates'
import { Pagination } from '@/components/shared/Pagination'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { resolveMediaUrl } from '@/lib/api-url'

import {
  ArrowUpRight,
  Star,
  TreePine,
  Leaf,
  PanelTop,
  Layers,
  Grip,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { Product } from '@/types'

const MATERIAL_FILTERS = [
  { value: 'go-cong-nghiep', label: 'Gỗ công nghiệp', labelEn: 'Industrial Wood', icon: TreePine },
  { value: 'go-tu-nhien', label: 'Gỗ tự nhiên', labelEn: 'Natural Wood', icon: Leaf },
  { value: 'acrylic', label: 'Acrylic', labelEn: 'Acrylic', icon: PanelTop },
  { value: 'melamine', label: 'Melamine', labelEn: 'Melamine', icon: Grip },
  { value: 'laminate', label: 'Laminate', labelEn: 'Laminate', icon: Layers },
]

// Mau vat lieu cho Material Samples section
const MATERIAL_SAMPLES = [
  { name: 'Oak', image: '/images/materials/oak.jpg', color: '#C4A777' },
  { name: 'Granite', image: '/images/materials/granite.jpg', color: '#8B8680' },
  { name: 'Brass', image: '/images/materials/brass.jpg', color: '#B5935A' },
  { name: 'Marble', image: '/images/materials/marble.jpg', color: '#E8E3DE' },
  { name: 'Walnut', image: '/images/materials/walnut.jpg', color: '#5C3D2E' },
  { name: 'Cherry', image: '/images/materials/cherry.jpg', color: '#8B4513' },
]

/** Gom cover_image + images thanh mang cho CardCarousel */
function buildProductImages(product: Product): { src: string; alt: string }[] {
  const result: { src: string; alt: string }[] = []
  if (product.cover_image?.preview_url) {
    result.push({ src: resolveMediaUrl(product.cover_image.preview_url), alt: product.cover_image.alt_text || product.name })
  }
  if (product.images) {
    for (const img of product.images) {
      if (img.media?.preview_url) {
        result.push({ src: resolveMediaUrl(img.media.preview_url), alt: img.caption || img.media.alt_text || product.name })
      }
    }
  }
  return result
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <section className="bg-surface py-[60px] md:py-24">
        <PageContainer>
          <div className="mb-12">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-10 w-full max-w-80 mb-3" />
            <div className="skeleton h-5 w-full max-w-96" />
          </div>
          <CardGridSkeleton count={6} />
        </PageContainer>
      </section>
    }>
      <CatalogContent />
    </Suspense>
  )
}

function CatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const currentMaterial = searchParams.get('material') || ''

  const { items: products, meta, page, loading, error, goToPage, refresh, isEmpty } =
    usePaginatedList<Product>({
      endpoint: '/products',
      limit: 12,
      params: { material_type: currentMaterial || undefined },
    })

  function updateParams(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    router.push(`/catalog?${sp.toString()}`)
  }

  const activeFilter = MATERIAL_FILTERS.find(f => f.value === currentMaterial)

  return (
    <section className="section-surface">
      <PageContainer>
        {/* Page Header — compact with total count */}
        <div className="mb-6">
          <p className="font-label text-label-sm uppercase tracking-[0.08em] text-primary/70">
            Sản phẩm
          </p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h1 className="font-headline text-headline-sm text-gradient-primary md:text-headline-md">
              Sản Phẩm Nội Thất
            </h1>
            {meta && !loading && (
              <span className="shrink-0 font-label text-label-md text-on-surface-variant">
                {meta.total} Sản phẩm
              </span>
            )}
          </div>
          <p className="mt-1.5 max-w-2xl text-body-sm text-on-surface-variant">
            Khám phá những không gian bếp được chế tác tỉ mỉ, kết hợp giữa chất liệu cao cấp và thiết kế hiện đại.
          </p>
          <span className="deco-line mt-3" />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 min-h-[44px] text-body-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
            {currentMaterial && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary">
                1
              </span>
            )}
          </button>
          {activeFilter && (
            <button
              onClick={() => updateParams({ material: '', page: '' })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-container px-3 py-2 min-h-[44px] text-body-sm text-on-primary"
            >
              {activeFilter.label}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Mobile Filter Chips (horizontal scroll) */}
        {mobileFilterOpen && (
          <div className="mb-6 overflow-x-auto pb-2 lg:hidden">
            <div className="flex gap-2 px-1">
              <button
                onClick={() => { updateParams({ material: '', page: '' }); setMobileFilterOpen(false) }}
                className={`shrink-0 rounded-xl px-4 py-2.5 min-h-[44px] text-body-sm font-medium transition-all duration-300 ${
                  !currentMaterial
                    ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                Tất cả
              </button>
              {MATERIAL_FILTERS.map((material) => {
                const Icon = material.icon
                return (
                  <button
                    key={material.value}
                    onClick={() => { updateParams({ material: material.value, page: '' }); setMobileFilterOpen(false) }}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-body-sm font-medium transition-all duration-300 ${
                      currentMaterial === material.value
                        ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {material.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-8 lg:flex-row">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden shrink-0 lg:block lg:w-56">
            <div className="lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
              <h3 className="mb-5 font-label text-label-lg uppercase tracking-[0.06em] text-on-surface">
                Material Filters
              </h3>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => updateParams({ material: '', page: '' })}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left text-body-md transition-all duration-300 ${
                    !currentMaterial
                      ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                      : 'text-on-surface-variant hover:translate-x-1 hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <Grip className="h-5 w-5 shrink-0" />
                  Tất cả vật liệu
                </button>
                {MATERIAL_FILTERS.map((material) => {
                  const Icon = material.icon
                  return (
                    <button
                      key={material.value}
                      onClick={() => updateParams({ material: material.value, page: '' })}
                      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left text-body-md transition-all duration-300 ${
                        currentMaterial === material.value
                          ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                          : 'text-on-surface-variant hover:translate-x-1 hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {material.label}
                    </button>
                  )
                })}
              </div>

              {/* Apply Filters CTA */}
              {currentMaterial && (
                <button
                  onClick={() => updateParams({ material: '', page: '' })}
                  className="mt-6 w-full rounded-xl bg-surface-container px-4 py-3 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            <DataStates
              loading={loading}
              error={error}
              isEmpty={isEmpty}
              onRetry={refresh}
              emptyMessage="Không tìm thấy sản phẩm. Thử thay đổi bộ lọc để tìm sản phẩm phù hợp."
            >
              {/* Product Grid - gap-8 desktop, gap-4 mobile, aspect-[4/5] cards */}
              <div className="grid gap-4 grid-cols-2 md:gap-8 xl:grid-cols-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/catalog/${product.slug}`}
                    className="card-premium group overflow-hidden rounded-2xl bg-surface-container-lowest"
                  >
                    {/* Image — Instagram-style carousel khi co nhieu anh */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                      <CardCarousel
                        images={buildProductImages(product)}
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      {/* New badge */}
                      {!!product.is_new && (
                        <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1 font-label text-label-sm uppercase text-on-surface shadow-ambient-sm backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Mới
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-5">
                      {product.category && (
                        <p className="font-label text-[11px] uppercase tracking-[0.1em] text-primary/60 md:text-label-md md:tracking-[0.06em]">
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="mt-1 line-clamp-2 font-headline text-title-md text-on-surface transition-colors duration-300 group-hover:text-primary-container md:text-title-lg">
                        {product.name}
                      </h3>
                      {/* View link - desktop only */}
                      <p className="mt-2 hidden items-center gap-1 text-body-sm text-on-surface-variant transition-colors group-hover:text-primary md:flex">
                        Xem chi tiết
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination meta={meta} currentPage={page} onPageChange={goToPage} variant="simple" />
            </DataStates>
          </div>
        </div>

        {/* Material Samples Section */}
        <MaterialSamplesSection />
      </PageContainer>
    </section>
  )
}

/** Material Samples - horizontal scrolling carousel (7.html design) */
function MaterialSamplesSection() {
  return (
    <div className="mt-20 md:mt-28">
      <div className="mb-8 text-center">
        <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
          Chất liệu
        </p>
        <h2 className="mt-2 font-headline text-headline-md text-on-surface md:text-headline-lg">
          Material Samples
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-body-md text-on-surface-variant">
          Trải nghiệm chất liệu thực tế tại showroom hoặc đặt mẫu về nhà.
        </p>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex justify-start gap-6 px-1 md:gap-12">
          {MATERIAL_SAMPLES.map((sample) => (
            <div key={sample.name} className="flex shrink-0 flex-col items-center gap-3">
              <div
                className="h-20 w-20 overflow-hidden rounded-full shadow-ambient transition-transform duration-300 hover:scale-110 md:h-24 md:w-24"
                style={{ backgroundColor: sample.color }}
              >
                {/* Placeholder — API se tra ve image URL thuc */}
                <div className="h-full w-full rounded-full" />
              </div>
              <span className="font-label text-label-md text-on-surface-variant">
                {sample.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
