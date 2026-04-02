'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  target,
  suffix = '',
  duration = 2000,
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const rafIdRef = useRef<number>(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          // Skip animation khi user bat reduced motion
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setCount(target)
            return
          }

          const startTime = performance.now()

          function animate(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic for a satisfying deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = Math.round(eased * target)

            setCount(current)

            if (progress < 1) {
              rafIdRef.current = requestAnimationFrame(animate)
            }
          }

          rafIdRef.current = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafIdRef.current)
    }
  }, [target, duration, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
