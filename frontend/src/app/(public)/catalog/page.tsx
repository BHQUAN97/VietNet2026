'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { ArrowUpRight, Sparkles } from 'lucide-react'
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
  { value: 'go-cong-nghiep', label: 'Gỗ công nghiệp' },
  { value: 'go-tu-nhien', label: 'Gỗ tự nhiên' },
  { value: 'acrylic', label: 'Acrylic' },
  { value: 'melamine', label: 'Melamine' },
  { value: 'laminate', label: 'Laminate' },
]

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <section className="bg-surface py-16 md:py-24">
        <PageContainer>
          <div className="mb-12">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-8 w-72 mb-3" />
            <div className="skeleton h-5 w-80" />
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

  return (
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        {/* Page Header */}
        <div className="mb-12">
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            Sản phẩm
          </p>
          <h1 className="mt-3 font-headline text-headline-lg text-gradient-primary md:text-display-md">
            Danh mục sản phẩm
          </h1>
          <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">
            Tìm kiếm sản phẩm nội thất phù hợp với không gian của bạn.
          </p>
          <span className="deco-line mt-5" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filter */}
          <aside className="shrink-0 lg:w-56">
            <div className="lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
              <h3 className="mb-4 font-label text-label-md uppercase tracking-[0.06em] text-on-surface">
                Vật liệu
              </h3>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                <button
                  onClick={() => updateParams({ material: '', page: '' })}
                  className={`rounded-xl px-3.5 py-2 text-left text-body-sm transition-all duration-300 ${
                    !currentMaterial
                      ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  Tất cả
                </button>
                {MATERIAL_FILTERS.map((material) => (
                  <button
                    key={material.value}
                    onClick={() => updateParams({ material: material.value, page: '' })}
                    className={`rounded-xl px-3.5 py-2 text-left text-body-sm transition-all duration-300 ${
                      currentMaterial === material.value
                        ? 'bg-primary-container text-on-primary shadow-ambient-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    {material.label}
                  </button>
                ))}
              </div>
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
                  <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-surface-container-high" />
                  <p className="text-body-md text-on-surface-variant">
                    Không tìm thấy sản phẩm phù hợp.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/catalog/${product.slug}`}
                      className="card-premium group overflow-hidden rounded-2xl bg-surface-container-lowest"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                        {product.cover_image?.preview_url ? (
                          <Image
                            src={product.cover_image.preview_url}
                            alt={product.cover_image.alt_text || product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-surface-container">
                            <div className="h-12 w-12 rounded-lg bg-surface-container-high" />
                          </div>
                        )}
                        {/* New badge */}
                        {product.is_new && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 font-label text-label-sm uppercase text-on-primary shadow-ambient-sm">
                            <Sparkles className="h-3 w-3" />
                            Mới
                          </span>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-on-surface/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          <div className="m-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-primary shadow-ambient-sm transition-transform duration-300 group-hover:scale-110">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        {product.category && (
                          <p className="font-label text-label-md uppercase tracking-[0.06em] text-primary/60">
                            {product.category.name}
                          </p>
                        )}
                        <h3 className="mt-1.5 font-headline text-title-md text-on-surface transition-colors duration-300 group-hover:text-primary-container md:text-title-lg">
                          {product.name}
                        </h3>
                        {/* Material & finish tags */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {product.material_type && (
                            <span className="rounded-lg bg-surface-container px-2 py-0.5 text-body-sm text-on-surface-variant">
                              {product.material_type}
                            </span>
                          )}
                          {product.finish && (
                            <span className="rounded-lg bg-surface-container px-2 py-0.5 text-body-sm text-on-surface-variant">
                              {product.finish}
                            </span>
                          )}
                        </div>
                        {/* Price */}
                        {product.price_range && (
                          <p className="mt-3 font-headline text-title-md text-primary">
                            {product.price_range}
                          </p>
                        )}
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
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
