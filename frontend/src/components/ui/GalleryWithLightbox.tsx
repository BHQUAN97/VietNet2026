'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lightbox } from './Lightbox'

interface GalleryItem {
  id: string
  caption?: string
  media?: {
    preview_url?: string
    alt_text?: string
  }
}

interface GalleryWithLightboxProps {
  items: GalleryItem[]
}

export function GalleryWithLightbox({ items }: GalleryWithLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxImages = items
    .filter((item) => item.media?.preview_url)
    .map((item) => ({
      src: item.media!.preview_url!,
      alt: item.caption || item.media!.alt_text || '',
    }))

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => {
              const imgIndex = lightboxImages.findIndex(
                (img) => img.src === item.media?.preview_url
              )
              if (imgIndex >= 0) setLightboxIndex(imgIndex)
            }}
            aria-label={`Xem hinh ${item.caption || item.media?.alt_text || `${index + 1}`}`}
          >
            {item.media?.preview_url && (
              <Image
                src={item.media.preview_url}
                alt={item.caption || item.media.alt_text || ''}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-on-background/50 to-transparent p-4">
                <p className="text-body-sm text-white">{item.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

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
