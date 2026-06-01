'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackClassName?: string
}

/**
 * Image component với fallback graceful khi ảnh không load được.
 * Dùng cho các card hiển thị ảnh từ external sources (Unsplash, etc.)
 */
export function SafeImage({ fallbackClassName, className, alt, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-surface-container ${fallbackClassName ?? ''}`}>
        <span className="text-4xl text-on-surface-variant/20">&#9633;</span>
      </div>
    )
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
