'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'left' | 'right' | 'scale' | 'fade'
  delay?: number
}

/**
 * Wrapper component - tu dong animate khi element vao viewport
 */
export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const directionClass = {
    up: 'reveal',
    left: 'reveal-left',
    right: 'reveal-right',
    scale: 'reveal-scale',
    fade: 'reveal-fade',
  }[direction]

  return (
    <div
      ref={ref}
      className={cn(directionClass, isVisible && 'is-visible', className)}
      style={delay > 0 ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
