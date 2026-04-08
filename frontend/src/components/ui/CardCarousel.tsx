'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselImage {
  src: string
  alt: string
}

interface CardCarouselProps {
  images: CarouselImage[]
  /** Image sizes hint cho Next.js */
  sizes?: string
  /** Cho phep scale khi hover (single image) */
  hoverScale?: boolean
}

/**
 * Mini carousel Instagram-style dung chung cho card listings.
 * - Swipe tren mobile, arrows khi hover tren desktop
 * - Dots indicator o duoi
 * - Click arrows KHONG trigger Link cha
 */
export function CardCarousel({ images, sizes, hoverScale = true }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const scrollToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1))
    setCurrentIndex(clamped)
    const container = scrollRef.current
    if (container) {
      container.scrollTo({ left: clamped * container.offsetWidth, behavior: 'smooth' })
    }
  }, [images.length])

  // Sync index khi user scroll (touch)
  useEffect(() => {
    const container = scrollRef.current
    if (!container || images.length <= 1) return
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        if (container) {
          const w = container.offsetWidth
          if (w > 0) setCurrentIndex(Math.round(container.scrollLeft / w))
        }
        ticking = false
      })
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [images.length])

  function handleTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; touchEndX.current = null }
  function handleTouchMove(e: React.TouchEvent) { touchEndX.current = e.touches[0].clientX }
  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 40) scrollToIndex(currentIndex + 1)
    else if (diff < -40) scrollToIndex(currentIndex - 1)
    touchStartX.current = null; touchEndX.current = null
  }

  // Khong co anh
  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-container">
        <div className="h-12 w-12 rounded-lg bg-surface-container-high" />
      </div>
    )
  }

  // Chi 1 anh → render don gian
  if (images.length === 1) {
    return (
      <Image
        src={images[0].src}
        alt={images[0].alt}
        fill
        className={`object-cover ${hoverScale ? 'transition-transform duration-700 ease-out group-hover:scale-110' : ''}`}
        sizes={sizes}
      />
    )
  }

  return (
    <>
      {/* Carousel scroll container */}
      <div
        ref={scrollRef}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((img, i) => (
          <div key={i} className="relative h-full w-full flex-shrink-0 snap-center">
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes={sizes} />
          </div>
        ))}
      </div>

      {/* Left arrow */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToIndex(currentIndex - 1) }}
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-md opacity-0 transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Right arrow */}
      {currentIndex < images.length - 1 && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToIndex(currentIndex + 1) }}
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-md opacity-0 transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
          aria-label="Ảnh sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1">
        {images.length <= 8 ? (
          images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'w-3.5 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))
        ) : (
          <span className="rounded-full bg-on-surface/60 px-2 py-0.5 font-label text-[10px] text-white">
            {currentIndex + 1}/{images.length}
          </span>
        )}
      </div>
    </>
  )
}
