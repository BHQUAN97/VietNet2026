'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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
  const ref = useRef<HTMLSpanElement>(null)

  // Dung useCallback de dam bao callback khong thay doi
  const targetRef = useRef(target)
  const durationRef = useRef(duration)
  targetRef.current = target
  durationRef.current = duration

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let rafId = 0
    let animated = false

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          animated = true
          observer.disconnect()

          const t = targetRef.current
          const d = durationRef.current

          // Skip animation khi user bat reduced motion
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setCount(t)
            return
          }

          const startTime = performance.now()

          function animate(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / d, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * t))

            if (progress < 1) {
              rafId = requestAnimationFrame(animate)
            }
          }

          rafId = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, []) // Empty deps — run once on mount

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
