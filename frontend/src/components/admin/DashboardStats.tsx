'use client'

import {
  Briefcase,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
} from 'lucide-react'

/**
 * DashboardStats — 4 KPI stat cards
 * Desktop: 4 cols | Mobile: featured card full width + 2 cols
 * Matching design screen 8 (desktop) va 16 (mobile)
 */

export interface StatItem {
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon: React.ReactNode
  featured?: boolean
}

// Demo data mac dinh
export const DEFAULT_STATS: StatItem[] = [
  {
    label: 'TOTAL VISITORS',
    value: '24,812',
    trend: 14,
    trendLabel: '+14%',
    icon: <Eye className="h-5 w-5" />,
    featured: true,
  },
  {
    label: 'AVG. SESSION',
    value: '4m 32s',
    trendLabel: 'Stable',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'CONVERSION',
    value: '3.2%',
    trend: -2,
    trendLabel: '-2%',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    label: 'INQUIRIES',
    value: '156',
    trend: 8,
    trendLabel: '+8%',
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

// Mobile-specific demo data (matching screen 16)
export const MOBILE_STATS: StatItem[] = [
  {
    label: 'TOTAL VISITS',
    value: '12.4k',
    trend: 14,
    trendLabel: '+14% from last week',
    icon: <Eye className="h-5 w-5" />,
    featured: true,
  },
  {
    label: 'LEADS',
    value: '84',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'ACTIVE POSTS',
    value: '126',
    icon: <Briefcase className="h-5 w-5" />,
  },
]

function StatCard({ stat }: { stat: StatItem }) {
  const trendPositive = (stat.trend ?? 0) >= 0

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 transition-colors hover:bg-surface-container-low/60">
      <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
        {stat.label}
      </p>
      <p className="mt-3 font-body text-headline-md font-bold text-on-surface">
        {stat.value}
      </p>
      {stat.trendLabel && (
        <div className="mt-2 flex items-center gap-1.5">
          {stat.trend !== undefined && (
            trendPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-error" />
            )
          )}
          <span
            className={`text-body-sm font-medium ${
              stat.trend === undefined
                ? 'text-on-surface-variant'
                : trendPositive
                  ? 'text-success'
                  : 'text-error'
            }`}
          >
            {stat.trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}

/** Featured stat card: wider, primary background on mobile */
function FeaturedStatCard({ stat }: { stat: StatItem }) {
  const trendPositive = (stat.trend ?? 0) >= 0

  return (
    <div className="rounded-2xl bg-surface-container-high p-6 md:bg-surface-container-lowest md:p-5">
      <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
        {stat.label}
      </p>
      <p className="mt-3 font-body text-headline-lg font-bold text-on-surface md:text-headline-md">
        {stat.value}
      </p>
      {stat.trendLabel && (
        <div className="mt-2 flex items-center gap-1.5">
          {stat.trend !== undefined && (
            trendPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-error" />
            )
          )}
          <span
            className={`text-body-sm font-medium ${
              stat.trend === undefined
                ? 'text-on-surface-variant'
                : trendPositive
                  ? 'text-success'
                  : 'text-error'
            }`}
          >
            {stat.trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}

// Skeleton cho loading state
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 animate-pulse">
      <div className="h-3 w-20 rounded bg-surface-container" />
      <div className="mt-4 h-7 w-24 rounded bg-surface-container" />
      <div className="mt-3 h-3 w-16 rounded bg-surface-container" />
    </div>
  )
}

interface DashboardStatsProps {
  stats?: StatItem[]
  isLoading?: boolean
}

export function DashboardStats({ stats = DEFAULT_STATS, isLoading = false }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        stat.featured ? (
          <div key={idx} className="col-span-2 md:col-span-1">
            <FeaturedStatCard stat={stat} />
          </div>
        ) : (
          <StatCard key={idx} stat={stat} />
        )
      ))}
    </div>
  )
}
