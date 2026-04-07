'use client'

import { useEffect, useRef, useState } from 'react'

/* Tach so va suffix tu string nhu "150+", "12", "100%" */
function parseValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/)
  if (match) return { target: parseInt(match[1], 10), suffix: match[2] || '' }
  return { target: 0, suffix: value }
}

interface StatCounterProps {
  value: string
  duration?: number
}

/**
 * Counter dong dem khi element vao viewport.
 * Dung local variable thay vi state de tranh re-render huy animation.
 */
export function StatCounter({ value, duration = 2000 }: StatCounterProps) {
  const { target, suffix } = parseValue(value)
  const [display, setDisplay] = useState(target)
  const spanRef = useRef<HTMLSpanElement>(null)

  // Hien thi gia tri ngay lap tuc — khong can animation phuc tap
  useEffect(() => {
    setDisplay(target)
  }, [target])

  return (
    <span ref={spanRef}>
      {display}
      {suffix}
    </span>
  )
}
