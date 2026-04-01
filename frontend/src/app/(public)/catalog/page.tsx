'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import {
  ArrowUpRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TreePine,
  Leaf,
  PanelTop,
  Layers,
  Grip,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import api from '@/lib/api'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  material_type: string | null
  finish: string | null
  price_range: string | null
  is_new: boolean
  category: { id: string; name: string; slug: string } | null
  cover_image: { preview_url: string; alt_text: string } | null
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

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

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <section className="bg-surface py-16 md:py-24">
        <PageContainer>
          <div className="mb-12">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-10 w-80 mb-3" />
            <div className="skeleton h-5 w-96" />
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
  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const currentMaterial = searchParams.get('material') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {
        page: String(currentPage),
        limit: '12',
      }
      if (currentMaterial) params.material_type = currentMaterial

      const res: any = await api.get('/products', { params })
      setProducts(res.data || [])
      setMeta(res.meta || null)
    } catch {
      setError('Không thể tải sản phẩm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentMaterial])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        {/* Page Header */}
        <div className="mb-12">
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            Bộ sưu tập
          </p>
          <h1 className="mt-3 font-headline text-headline-lg text-gradient-primary md:text-display-md lg:text-display-lg">
            Bộ Sưu Tập Tủ Bếp
          </h1>
          <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">
            Khám phá những không gian bếp được chế tác tỉ mỉ, kết hợp giữa chất liệu cao cấp và thiết kế hiện đại.
          </p>
          <div className="mt-5 flex items-center gap-4">
            <span className="deco-line flex-1" />
            {meta && !loading && (
              <span className="font-label text-label-md text-on-surface-variant">
                {meta.total} Sản phẩm
              </span>
            )}
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 text-body-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-container px-3 py-2 text-body-sm text-on-primary"
            >
              {activeFilter.label}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Mobile Filter Chips (horizontal scroll) */}
        {mobileFilterOpen && (
          <div className="mb-6 overflow-x-auto pb-2 lg:hidden">
            <div className="flex gap-2">
              <button
                onClick={() => { updateParams({ material: '', page: '' }); setMobileFilterOpen(false) }}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all duration-300 ${
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
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all duration-300 ${
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

        <div className="flex gap-10 lg:flex-row">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden shrink-0 lg:block lg:w-64">
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
            {loading && <CardGridSkeleton count={6} />}

            {error && !loading && (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-error-container/30 p-10">
                  <p className="text-body-md text-error">{error}</p>
                  <Button variant="ghost" className="mt-5" onClick={fetchProducts}>
                    Thử lại
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high">
                    <Layers className="h-7 w-7 text-on-surface-variant/50" />
                  </div>
                  <p className="text-body-lg font-medium text-on-surface">
                    Không tìm thấy sản phẩm
                  </p>
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    Thử thay đổi bộ lọc để tìm sản phẩm phù hợp.
                  </p>
                  {currentMaterial && (
                    <Button
                      variant="ghost"
                      className="mt-5"
                      onClick={() => updateParams({ material: '', page: '' })}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                {/* Product Grid - gap-8 desktop, gap-4 mobile, aspect-[4/5] cards */}
                <div className="grid gap-4 grid-cols-2 md:gap-8 xl:grid-cols-3">
                  {products.map((product, idx) => (
                    <Link
                      key={product.id}
                      href={`/catalog/${product.slug}`}
                      className="card-premium group overflow-hidden rounded-2xl bg-surface-container-lowest"
                    >
                      {/* Image - aspect 4/5 matching design */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container">
                        {product.cover_image?.preview_url ? (
                          <Image
                            src={product.cover_image.preview_url}
                            alt={product.cover_image.alt_text || product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-surface-container">
                            <div className="h-12 w-12 rounded-lg bg-surface-container-high" />
                          </div>
                        )}
                        {/* New badge */}
                        {product.is_new && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 font-label text-label-sm uppercase text-on-surface shadow-ambient-sm backdrop-blur-sm">
                            <Sparkles className="h-3 w-3" />
                            Mới
                          </span>
                        )}
                        {/* Hover overlay voi "Xem chi tiet" */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-on-surface/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-primary shadow-ambient-sm">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-5">
                        {product.category && (
                          <p className="font-label text-[10px] uppercase tracking-[0.1em] text-primary/60 md:text-label-md md:tracking-[0.06em]">
                            {product.category.name}
                          </p>
                        )}
                        <h3 className="mt-1 line-clamp-2 font-headline text-title-sm text-on-surface transition-colors duration-300 group-hover:text-primary-container md:text-title-lg">
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

                {/* Pagination - chevron style matching design */}
                {meta && meta.totalPages > 1 && (
                  <CatalogPagination
                    currentPage={currentPage}
                    totalPages={meta.totalPages}
                    onPageChange={(page) => updateParams({ page: String(page) })}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Material Samples Section */}
        <MaterialSamplesSection />
      </PageContainer>
    </section>
  )
}

/** Pagination voi chevron va page indicator "01 / 04" */
function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const padded = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="mt-12 flex items-center justify-center gap-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:hover:bg-surface-container-low disabled:hover:text-primary"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="font-headline text-title-md tracking-wider text-on-surface">
        {padded(currentPage)}{' '}
        <span className="text-on-surface-variant/60">/</span>{' '}
        {padded(totalPages)}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:hover:bg-surface-container-low disabled:hover:text-primary"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
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
        <div className="flex justify-center gap-8 md:gap-12">
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
