'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
  Mail,
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
  trend?: number // percentage change
  icon: React.ReactNode
  href?: string
}

interface AnalyticsDashboardData {
  totalViews: number
  totalUnique: number
}

// ─── Skeleton Card ─────────────────────────────────────────────

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
      <td className="px-4 py-3">
        <div className="h-4 w-32 rounded bg-surface-container animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 rounded bg-surface-container animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-16 rounded-full bg-surface-container animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 rounded bg-surface-container animate-pulse" />
      </td>
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

// ─── Quick Action Card ─────────────────────────────────────────

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-5 transition-colors hover:bg-surface-container-low/50"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-fixed/20 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-md font-medium text-on-surface">{title}</p>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-1" />
    </Link>
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
      // Build date range for analytics: last 30 days
      const now = new Date()
      const end = now.toISOString().split('T')[0]
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      // Previous period for trend calculation
      const prevEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      const prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      // Fetch all data in parallel
      const [analyticsRes, prevAnalyticsRes, consultationsRes, projectsRes, productsRes] =
        await Promise.allSettled([
          api.get(`/analytics/dashboard?start=${start}&end=${end}`),
          api.get(`/analytics/dashboard?start=${prevStart}&end=${prevEnd}`),
          api.get('/consultations', { params: { page: 1, limit: 5 } }),
          api.get('/projects', { params: { status: 'published', page: 1, limit: 1 } }),
          api.get('/products', { params: { status: 'published', page: 1, limit: 1 } }),
        ])

      // Process analytics
      if (analyticsRes.status === 'fulfilled') {
        const data = (analyticsRes.value as unknown as ApiResponse<AnalyticsDashboardData>).data
        setTotalVisitors(data?.totalViews ?? 0)

        // Calculate trend
        if (prevAnalyticsRes.status === 'fulfilled') {
          const prevData = (prevAnalyticsRes.value as unknown as ApiResponse<AnalyticsDashboardData>).data
          const prevViews = prevData?.totalViews ?? 0
          if (prevViews > 0) {
            const trend = Math.round(((data?.totalViews ?? 0) - prevViews) / prevViews * 100)
            setVisitorTrend(trend)
          }
        }
      }

      // Process consultations
      if (consultationsRes.status === 'fulfilled') {
        const result = consultationsRes.value as unknown as ApiResponse<Consultation[]>
        setRecentConsultations(result.data || [])
        // Count new consultations from meta
        const meta = result.meta as PaginationMeta | undefined
        setNewConsultations(meta?.total ?? 0)
      }

      // Process projects count
      if (projectsRes.status === 'fulfilled') {
        const result = projectsRes.value as unknown as ApiResponse<unknown[]>
        setPublishedProjects(result.meta?.total ?? 0)
      }

      // Process products count
      if (productsRes.status === 'fulfilled') {
        const result = productsRes.value as unknown as ApiResponse<unknown[]>
        setPublishedProducts(result.meta?.total ?? 0)
      }

      // Check if all failed
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
      label: 'Lượt truy cập (30 ngày)',
      value: totalVisitors,
      trend: visitorTrend,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Yêu cầu tư vấn',
      value: newConsultations,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      label: 'Dự án đã xuất bản',
      value: publishedProjects,
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      label: 'Sản phẩm đã xuất bản',
      value: publishedProducts,
      icon: <Package className="h-5 w-5" />,
    },
  ]

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">Dashboard</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Tổng quan hoạt động hệ thống.
          </p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpis.map((kpi) => <KPICard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Bottom section: Recent Consultations + Quick Actions */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Recent Consultations */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-title-lg text-on-surface">
              Yêu cầu tư vấn gần đây
            </h2>
            <Link
              href="/admin/consultations"
              className="flex items-center gap-1 text-body-sm font-medium text-primary hover:underline"
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl bg-surface-container-lowest">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Loại
                  </th>
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 font-label text-label-md uppercase tracking-label-wide text-on-surface-variant">
                    Ngày gửi
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
                        <p className="text-body-md font-medium text-on-surface">{c.name}</p>
                        <p className="mt-0.5 text-body-sm text-on-surface-variant">
                          {c.email}
                        </p>
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

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 font-headline text-title-lg text-on-surface">
            Thao tác nhanh
          </h2>
          <div className="flex flex-col gap-3">
            <QuickActionCard
              title="Thêm dự án mới"
              description="Tạo và xuất bản dự án"
              href="/admin/projects"
              icon={<Plus className="h-5 w-5" />}
            />
            <QuickActionCard
              title="Quản lý tư vấn"
              description="Xem và xử lý yêu cầu"
              href="/admin/consultations"
              icon={<Mail className="h-5 w-5" />}
            />
            <QuickActionCard
              title="Phân tích truy cập"
              description="Xem báo cáo chi tiết"
              href="/admin/analytics"
              icon={<BarChart3 className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
