'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Eye,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import type { AnalyticsDashboard } from '@/types'

type DateRange = '7d' | '30d' | '90d' | 'custom'

function formatDateParam(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDateRange(range: DateRange): { start: string; end: string } {
  const end = new Date()
  const start = new Date()

  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    default:
      start.setDate(end.getDate() - 30)
  }

  return { start: formatDateParam(start), end: formatDateParam(end) }
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<DateRange>('30d')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { start, end } = getDateRange(range)
      const res = await api.get(
        `/analytics/dashboard?start=${start}&end=${end}`,
      )
      setData((res as any).data)
    } catch {
      setError('Khong the tai du lieu phan tich')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="py-4">
        <h1 className="font-headline text-headline-lg text-on-surface">
          Phan tich
        </h1>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-surface-container" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4">
        <h1 className="font-headline text-headline-lg text-on-surface">
          Phan tich
        </h1>
        <div className="mt-8 rounded-2xl bg-error-container px-6 py-8 text-center">
          <p className="text-body-md text-on-error-container">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-label-md text-on-primary"
          >
            Thu lai
          </button>
        </div>
      </div>
    )
  }

  const totalDevice =
    (data?.deviceBreakdown.mobile || 0) +
    (data?.deviceBreakdown.desktop || 0) +
    (data?.deviceBreakdown.tablet || 0)

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">
            Phan tich
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Thong ke luot xem va hanh vi nguoi dung
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex rounded-xl bg-surface-container p-1">
            {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-label-md transition-colors',
                  range === r
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high',
                )}
              >
                {r === '7d' ? '7 ngay' : r === '30d' ? '30 ngay' : '90 ngay'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
            aria-label="Lam moi"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Tong luot xem"
          value={data?.totalViews || 0}
          color="primary"
        />
        <StatCard
          icon={Users}
          label="Khach truy cap"
          value={data?.totalUnique || 0}
          color="secondary"
        />
        <StatCard
          icon={Smartphone}
          label="Mobile"
          value={data?.deviceBreakdown.mobile || 0}
          suffix={totalDevice > 0 ? `${Math.round(((data?.deviceBreakdown.mobile || 0) / totalDevice) * 100)}%` : '0%'}
          color="tertiary"
        />
        <StatCard
          icon={Monitor}
          label="Desktop"
          value={data?.deviceBreakdown.desktop || 0}
          suffix={totalDevice > 0 ? `${Math.round(((data?.deviceBreakdown.desktop || 0) / totalDevice) * 100)}%` : '0%'}
          color="primary"
        />
      </div>

      {/* Chart area — daily trend */}
      <div className="mt-6 rounded-2xl bg-surface-container-low p-6">
        <h2 className="font-headline text-title-md text-on-surface">
          Xu huong luot xem
        </h2>
        <div className="mt-4">
          {data?.dailyTrend && data.dailyTrend.length > 0 ? (
            <TrendChart data={data.dailyTrend} />
          ) : (
            <div className="flex h-48 items-center justify-center text-body-md text-on-surface-variant">
              Chua co du lieu trong khoang thoi gian nay
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Top pages + Device breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top pages table */}
        <div className="rounded-2xl bg-surface-container-low p-6 lg:col-span-2">
          <h2 className="font-headline text-title-md text-on-surface">
            Trang duoc xem nhieu nhat
          </h2>
          <div className="mt-4 overflow-x-auto">
            {data?.topPages && data.topPages.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-label-sm text-on-surface-variant">
                    <th className="pb-3 pr-4">Trang</th>
                    <th className="pb-3 pr-4 text-right">Luot xem</th>
                    <th className="pb-3 text-right">Khach</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((page, i) => (
                    <tr
                      key={page.path}
                      className="border-t border-outline-variant/5"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-label-sm text-on-surface-variant/50">
                            {i + 1}
                          </span>
                          <span className="text-body-sm text-on-surface">
                            {page.path}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right text-body-sm font-medium text-on-surface">
                        {page.views.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-body-sm text-on-surface-variant">
                        {page.unique.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-8 text-center text-body-sm text-on-surface-variant">
                Chua co du lieu
              </p>
            )}
          </div>
        </div>

        {/* Device breakdown */}
        <div className="rounded-2xl bg-surface-container-low p-6">
          <h2 className="font-headline text-title-md text-on-surface">
            Thiet bi
          </h2>
          <div className="mt-6 space-y-4">
            <DeviceBar
              icon={Monitor}
              label="Desktop"
              value={data?.deviceBreakdown.desktop || 0}
              total={totalDevice}
            />
            <DeviceBar
              icon={Smartphone}
              label="Mobile"
              value={data?.deviceBreakdown.mobile || 0}
              total={totalDevice}
            />
            <DeviceBar
              icon={Tablet}
              label="Tablet"
              value={data?.deviceBreakdown.tablet || 0}
              total={totalDevice}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  suffix?: string
  color: 'primary' | 'secondary' | 'tertiary'
}) {
  const bgMap = {
    primary: 'bg-primary/5',
    secondary: 'bg-secondary/5',
    tertiary: 'bg-tertiary/5',
  }
  const iconBgMap = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    tertiary: 'bg-tertiary/10 text-tertiary',
  }

  return (
    <div className={cn('rounded-2xl p-5', bgMap[color])}>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconBgMap[color],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {suffix && (
          <span className="text-label-sm text-on-surface-variant">
            {suffix}
          </span>
        )}
      </div>
      <p className="mt-3 font-headline text-headline-md text-on-surface">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-body-sm text-on-surface-variant">{label}</p>
    </div>
  )
}

function DeviceBar({
  icon: Icon,
  label,
  value,
  total,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  total: number
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-on-surface-variant" />
          <span className="text-body-sm text-on-surface">{label}</span>
        </div>
        <span className="text-label-sm text-on-surface-variant">
          {value.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function TrendChart({
  data,
}: {
  data: Array<{ date: string; views: number; unique: number }>
}) {
  if (data.length === 0) return null

  const maxViews = Math.max(...data.map((d) => d.views), 1)
  const chartHeight = 200

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 flex h-[200px] flex-col justify-between text-label-sm text-on-surface-variant/50">
        <span>{maxViews.toLocaleString()}</span>
        <span>{Math.round(maxViews / 2).toLocaleString()}</span>
        <span>0</span>
      </div>

      {/* Chart bars */}
      <div className="ml-12 flex items-end gap-1" style={{ height: chartHeight }}>
        {data.map((d, i) => {
          const viewHeight = (d.views / maxViews) * chartHeight
          const uniqueHeight = (d.unique / maxViews) * chartHeight
          const dateStr = d.date.slice(5) // MM-DD

          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col items-center"
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-16 z-10 hidden rounded-lg bg-inverse-surface px-3 py-2 text-label-sm text-inverse-on-surface shadow-lg group-hover:block">
                <p>{d.date}</p>
                <p>Xem: {d.views.toLocaleString()}</p>
                <p>Khach: {d.unique.toLocaleString()}</p>
              </div>

              {/* View bar */}
              <div
                className="w-full rounded-t bg-primary/30 transition-all group-hover:bg-primary/50"
                style={{ height: `${viewHeight}px` }}
              />

              {/* Date label (show every few) */}
              {(i % Math.max(1, Math.floor(data.length / 8)) === 0 ||
                i === data.length - 1) && (
                <span className="mt-2 text-label-sm text-on-surface-variant/50">
                  {dateStr}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
