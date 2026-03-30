'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
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
  'Industrial Wood',
  'Natural Wood',
  'Acrylic',
  'Melamine',
  'Laminate',
]

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
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
      setError('Khong the tai san pham. Vui long thu lai.')
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
        <div className="mb-12">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-primary-container">
            San pham
          </p>
          <h1 className="mt-3 font-headline text-display-md text-on-surface md:text-display-lg">
            Danh muc san pham
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            Tim kiem san pham noi that phu hop voi khong gian cua ban.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filter */}
          <aside className="shrink-0 lg:w-56">
            <h3 className="mb-4 font-label text-label-lg uppercase tracking-label-wide text-on-surface">
              Vat lieu
            </h3>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              <button
                onClick={() => updateParams({ material: '', page: '' })}
                className={`rounded-lg px-3 py-2 text-left text-body-md transition-colors ${
                  !currentMaterial
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Tat ca
              </button>
              {MATERIAL_FILTERS.map((material) => (
                <button
                  key={material}
                  onClick={() => updateParams({ material, page: '' })}
                  className={`rounded-lg px-3 py-2 text-left text-body-md transition-colors ${
                    currentMaterial === material
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
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
                <Button variant="ghost" className="mt-4" onClick={fetchProducts}>
                  Thu lai
                </Button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && products.length === 0 && (
              <div className="flex min-h-[40vh] items-center justify-center">
                <p className="text-body-lg text-on-surface-variant">
                  Khong tim thay san pham phu hop.
                </p>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/catalog/${product.slug}`}
                      className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient-lg"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                        {product.cover_image?.preview_url ? (
                          <Image
                            src={product.cover_image.preview_url}
                            alt={product.cover_image.alt_text || product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-on-surface-variant/30">
                            <span className="text-5xl">&#9633;</span>
                          </div>
                        )}
                        {product.is_new && (
                          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-label text-label-sm uppercase text-on-primary">
                            New
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        {product.category && (
                          <p className="font-label text-label-md uppercase tracking-label-wide text-primary-container">
                            {product.category.name}
                          </p>
                        )}
                        <h3 className="mt-1 font-headline text-title-lg text-on-surface group-hover:text-primary">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-body-sm text-on-surface-variant/60">
                          {product.material_type && <span>{product.material_type}</span>}
                          {product.finish && <span>{product.finish}</span>}
                        </div>
                        {product.price_range && (
                          <p className="mt-3 font-body text-title-md text-primary">
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
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
