'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  MessageSquare,
  Briefcase,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Plus,
  BarChart3,
  FileText,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import api from '@/lib/api'
import type { ApiResponse, Consultation, PaginationMeta } from '@/types'
import { CONSULTATION_STATUS } from '@/lib/status-config'

// ─── Types ─────────────────────────────────────────────────────

interface DashboardKPI {
  label: string
  value: number | string
  trend?: number
  icon: React.ReactNode
}

interface AnalyticsDashboardData {
  totalViews: number
  totalUnique: number
}

// ─── Skeleton Components ──────────────────────────────────────

function KPICardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-surface-container" />
        <div className="h-4 w-16 rounded bg-surface-container" />
      </div>
      <div className="mt-4 h-8 w-20 rounded bg-surface-container" />
      <div className="mt-2 h-4 w-28 rounded bg-surface-container" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-surface-container animate-pulse" /><div className="h-4 w-32 rounded bg-surface-container animate-pulse" /></div></td>
      <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-surface-container animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-surface-container animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-surface-container animate-pulse" /></td>
    </tr>
  )
}

// ─── KPI Card ──────────────────────────────────────────────────

function KPICard({ kpi }: { kpi: DashboardKPI }) {
  const trendPositive = (kpi.trend ?? 0) >= 0

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 transition-colors hover:bg-surface-container-low/50">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed/20 text-primary">
          {kpi.icon}
        </div>
        {kpi.trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-label-sm font-medium ${
              trendPositive ? 'text-success-text' : 'text-error'
            }`}
          >
            {trendPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(kpi.trend)}%</span>
          </div>
        )}
      </div>
      <p className="mt-4 font-body text-headline-md font-bold text-on-surface">
        {typeof kpi.value === 'number' ? kpi.value.toLocaleString('vi-VN') : kpi.value}
      </p>
      <p className="mt-1 text-body-sm text-on-surface-variant">{kpi.label}</p>
    </div>
  )
}

// ─── Avatar Initials ──────────────────────────────────────────

function AvatarInitial({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed/20 font-label text-label-md font-medium text-primary">
      {initials}
    </div>
  )
}

// ─── Quick Action Cards (design 8.html) ───────────────────────

function QuickActionGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Primary CTA: Create New Listing */}
      <Link
        href="/admin/projects"
        className="group flex items-center gap-4 rounded-2xl bg-primary-container p-5 text-on-primary transition-shadow hover:shadow-ambient-lg"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface/20">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <p className="font-headline text-title-md font-semibold">Create New Listing</p>
          <p className="mt-0.5 text-body-sm opacity-80">Add a new project to the portfolio</p>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 opacity-60 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Pending Reviews */}
      <Link
        href="/admin/consultations"
        className="group flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-5 transition-colors hover:bg-surface-container-low/50"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning-bg text-warning-text">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <p className="font-headline text-title-md font-semibold text-on-surface">Pending Reviews</p>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">12 tasks remaining</p>
        </div>
      </Link>

      {/* Generate Report */}
      <Link
        href="/admin/analytics"
        className="group flex items-center gap-4 rounded-2xl bg-tertiary-container p-5 text-on-tertiary-container transition-shadow hover:shadow-ambient-lg"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface/20">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <p className="font-headline text-title-md font-semibold">Generate Report</p>
          <p className="mt-0.5 text-body-sm opacity-80">Monthly analytics summary</p>
        </div>
      </Link>
    </div>
  )
}

// ─── Top Performing Section (design 8.html) ───────────────────

function TopPerformingSection() {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5">
      <h3 className="mb-4 font-label text-label-lg uppercase tracking-label-wide text-on-surface-variant">
        Top Performing
      </h3>
      {/* Featured project image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-container">
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-on-surface/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <p className="font-headline text-title-md font-semibold text-surface">
            Saigon Serenity Villa
          </p>
          <p className="mt-0.5 text-body-sm text-surface/80">Modern Contemporary</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">Engagement</span>
            <span className="font-label text-label-md font-medium text-on-surface">94%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary-container transition-all duration-700" style={{ width: '94%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">Inquiry Rate</span>
            <span className="font-label text-label-md font-medium text-on-surface">12%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-tertiary transition-all duration-700" style={{ width: '12%' }} />
          </div>
        </div>
      </div>

      <Link
        href="/admin/analytics"
        className="mt-5 flex items-center gap-1 text-body-sm font-medium text-primary hover:underline"
      >
        View Detailed Insights
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

// ─── Main Dashboard Page ───────────────────────────────────────

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // KPI data
  const [totalVisitors, setTotalVisitors] = useState(0)
  const [visitorTrend, setVisitorTrend] = useState<number | undefined>(undefined)
  const [newConsultations, setNewConsultations] = useState(0)
  const [publishedProjects, setPublishedProjects] = useState(0)
  const [publishedProducts, setPublishedProducts] = useState(0)

  // Recent consultations
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([])

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const now = new Date()
      const end = now.toISOString().split('T')[0]
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      const prevEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      const prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const [analyticsRes, prevAnalyticsRes, consultationsRes, projectsRes, productsRes] =
        await Promise.allSettled([
          api.get(`/analytics/dashboard?start=${start}&end=${end}`),
          api.get(`/analytics/dashboard?start=${prevStart}&end=${prevEnd}`),
          api.get('/consultations', { params: { page: 1, limit: 5 } }),
          api.get('/projects', { params: { status: 'published', page: 1, limit: 1 } }),
          api.get('/products', { params: { status: 'published', page: 1, limit: 1 } }),
        ])

      if (analyticsRes.status === 'fulfilled') {
        const data = (analyticsRes.value as unknown as ApiResponse<AnalyticsDashboardData>).data
        setTotalVisitors(data?.totalViews ?? 0)

        if (prevAnalyticsRes.status === 'fulfilled') {
          const prevData = (prevAnalyticsRes.value as unknown as ApiResponse<AnalyticsDashboardData>).data
          const prevViews = prevData?.totalViews ?? 0
          if (prevViews > 0) {
            const trend = Math.round(((data?.totalViews ?? 0) - prevViews) / prevViews * 100)
            setVisitorTrend(trend)
          }
        }
      }

      if (consultationsRes.status === 'fulfilled') {
        const result = consultationsRes.value as unknown as ApiResponse<Consultation[]>
        setRecentConsultations(result.data || [])
        const meta = result.meta as PaginationMeta | undefined
        setNewConsultations(meta?.total ?? 0)
      }

      if (projectsRes.status === 'fulfilled') {
        const result = projectsRes.value as unknown as ApiResponse<unknown[]>
        setPublishedProjects(result.meta?.total ?? 0)
      }

      if (productsRes.status === 'fulfilled') {
        const result = productsRes.value as unknown as ApiResponse<unknown[]>
        setPublishedProducts(result.meta?.total ?? 0)
      }

      const allFailed = [analyticsRes, consultationsRes, projectsRes, productsRes].every(
        (r) => r.status === 'rejected'
      )
      if (allFailed) {
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
      }
    } catch {
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const kpis: DashboardKPI[] = [
    {
      label: 'Total Visitors',
      value: totalVisitors,
      trend: visitorTrend,
      icon: <Eye className="h-5 w-5" />,
    },
    {
      label: 'Avg. Session',
      value: '4m 32s',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Conversion',
      value: newConsultations > 0 && totalVisitors > 0
        ? `${((newConsultations / totalVisitors) * 100).toFixed(1)}%`
        : '0%',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: 'Inquiries',
      value: newConsultations,
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ]

  return (
    <div className="py-4">
      {/* Header — matching design 8.html */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
            Overview
          </p>
          <h1 className="mt-1 font-headline text-headline-lg text-primary md:text-display-sm">
            Dashboard
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDashboardData}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
          <p className="text-body-sm text-on-error-container">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="ml-auto text-body-sm text-on-error-container underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Quick Action Cards - design 8.html asymmetric grid */}
      <QuickActionGrid />

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpis.map((kpi) => <KPICard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Bottom section: Consultations table + Top Performing */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Recent Consultations — 2/3 width */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-title-lg text-on-surface">
              Recent Consultations
            </h2>
            <Link
              href="/admin/consultations"
              className="flex items-center gap-1 text-body-sm font-medium text-primary hover:underline"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl bg-surface-container-lowest">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Client
                  </th>
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Project Type
                  </th>
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : recentConsultations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-body-md text-on-surface-variant"
                    >
                      Chưa có yêu cầu tư vấn nào.
                    </td>
                  </tr>
                ) : (
                  recentConsultations.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-surface-container-low/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarInitial name={c.name} />
                          <div>
                            <p className="text-body-md font-medium text-on-surface">{c.name}</p>
                            <p className="text-body-sm text-on-surface-variant">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                        {c.project_type || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={CONSULTATION_STATUS[c.status]?.variant}
                          dot={CONSULTATION_STATUS[c.status]?.dot}
                        >
                          {CONSULTATION_STATUS[c.status]?.label || c.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                        {new Date(c.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing — 1/3 width */}
        <TopPerformingSection />
      </div>
    </div>
  )
}
