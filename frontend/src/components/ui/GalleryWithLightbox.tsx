'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Lightbox } from './Lightbox'
import { ChevronLeft, ChevronRight, Grid3X3, Image as ImageIcon } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/api-url'

interface GalleryItem {
  id: string
  caption?: string | null
  media?: {
    preview_url?: string
    alt_text?: string
  }
}

type ViewMode = 'carousel' | 'grid'

interface GalleryWithLightboxProps {
  items: GalleryItem[]
  /** Chế độ hiển thị mặc định */
  defaultMode?: ViewMode
}

/**
 * Gallery 2 chế độ giống Instagram:
 * - Carousel: lướt ngang từng ảnh, dots + caption
 * - Grid: lưới ảnh 3 cột, tap mở lightbox
 */
export function GalleryWithLightbox({ items, defaultMode = 'carousel' }: GalleryWithLightboxProps) {
  const [mode, setMode] = useState<ViewMode>(defaultMode)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const validItems = items.filter((item) => item.media?.preview_url)

  const lightboxImages = validItems.map((item) => ({
    src: resolveMediaUrl(item.media!.preview_url!),
    alt: item.caption || item.media!.alt_text || '',
  }))

  const scrollToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, validItems.length - 1))
    setCurrentIndex(clamped)
    const container = scrollRef.current
    if (container) {
      const slideWidth = container.offsetWidth
      container.scrollTo({ left: clamped * slideWidth, behavior: 'smooth' })
    }
  }, [validItems.length])

  const goNext = useCallback(() => scrollToIndex(currentIndex + 1), [currentIndex, scrollToIndex])
  const goPrev = useCallback(() => scrollToIndex(currentIndex - 1), [currentIndex, scrollToIndex])

  // Sync dots khi user scroll (touch/mouse)
  useEffect(() => {
    const container = scrollRef.current
    if (!container || mode !== 'carousel') return
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        if (container) {
          const slideWidth = container.offsetWidth
          if (slideWidth > 0) {
            const idx = Math.round(container.scrollLeft / slideWidth)
            setCurrentIndex(idx)
          }
        }
        ticking = false
      })
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [mode])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }
  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
  }
  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) goNext()
    else if (diff < -50) goPrev()
    touchStartX.current = null
    touchEndX.current = null
  }

  if (validItems.length === 0) return null

  return (
    <>
      {/* Toggle buttons — chỉ hiện khi có > 1 ảnh */}
      {validItems.length > 1 && (
        <div className="mx-auto mb-4 flex max-w-2xl justify-center gap-1 rounded-lg bg-surface-container p-1">
          <button
            onClick={() => setMode('carousel')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-label text-label-md transition-colors ${
              mode === 'carousel'
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            aria-label="Xem dạng carousel"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Carousel</span>
          </button>
          <button
            onClick={() => setMode('grid')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-label text-label-md transition-colors ${
              mode === 'grid'
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            aria-label="Xem dạng lưới"
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Lưới</span>
          </button>
        </div>
      )}

      {/* ═══ CAROUSEL MODE ═══ */}
      {mode === 'carousel' && (
        <>
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-lg">
            {/* Carousel container */}
            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {validItems.map((item, index) => (
                <div key={item.id} className="w-full flex-shrink-0 snap-center">
                  <button
                    type="button"
                    className="relative aspect-[4/5] md:aspect-[4/3] w-full overflow-hidden bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Xem ảnh ${item.caption || item.media?.alt_text || `${index + 1}`}`}
                  >
                    <Image
                      src={resolveMediaUrl(item.media!.preview_url!)}
                      alt={item.caption || item.media!.alt_text || ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 672px"
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Navigation arrows — desktop only */}
            {validItems.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-on-surface shadow-md transition-opacity hover:bg-white disabled:opacity-0 md:flex"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  disabled={currentIndex === validItems.length - 1}
                  className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-on-surface shadow-md transition-opacity hover:bg-white disabled:opacity-0 md:flex"
                  aria-label="Ảnh sau"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Counter badge */}
            {validItems.length > 1 && (
              <div className="absolute right-3 top-3 z-10 rounded-full bg-on-surface/60 px-2.5 py-0.5 font-label text-label-sm text-white">
                {currentIndex + 1}/{validItems.length}
              </div>
            )}
          </div>

          {/* Dots */}
          {validItems.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {validItems.length <= 10 ? (
                validItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-4 bg-primary'
                        : 'w-1.5 bg-on-surface/20'
                    }`}
                    aria-label={`Đến ảnh ${index + 1}`}
                  />
                ))
              ) : (
                <span className="font-label text-label-sm text-on-surface-variant">
                  {currentIndex + 1} / {validItems.length}
                </span>
              )}
            </div>
          )}

          {/* Caption */}
          {validItems[currentIndex]?.caption && (
            <p className="mx-auto mt-3 max-w-2xl text-body-md text-on-surface-variant">
              {validItems[currentIndex].caption}
            </p>
          )}
        </>
      )}

      {/* ═══ GRID MODE ═══ */}
      {mode === 'grid' && (
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-3 gap-0.5">
            {validItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="group relative aspect-square overflow-hidden bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                onClick={() => setLightboxIndex(index)}
                aria-label={`Xem ảnh ${item.caption || item.media?.alt_text || `${index + 1}`}`}
              >
                <Image
                  src={resolveMediaUrl(item.media!.preview_url!)}
                  alt={item.caption || item.media!.alt_text || ''}
                  fill
                  className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                  sizes="(max-width: 640px) 33vw, 224px"
                />
                {/* Hover overlay với caption */}
                {item.caption && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-on-surface/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <p className="p-2 text-left text-body-sm text-white line-clamp-2">{item.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox — dùng chung cho cả 2 mode */}
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
