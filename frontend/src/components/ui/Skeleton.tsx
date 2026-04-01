'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

/** Skeleton cho project/product card */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-5 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
      </div>
    </div>
  )
}

/** Grid skeleton cho listing pages */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
