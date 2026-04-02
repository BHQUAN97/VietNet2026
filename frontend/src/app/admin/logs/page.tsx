'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  X,
  Clock,
  Globe,
  User,
  Code,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/date'
import { formatNumber } from '@/lib/number'
import { DataStates } from '@/components/shared/DataStates'
import { Pagination } from '@/components/shared/Pagination'
import { useAdminList } from '@/hooks/useAdminList'

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

interface AppLog {
  id: string
  level: LogLevel
  message: string
  stack_trace: string | null
  endpoint: string | null
  status_code: number | null
  ip: string | null
  user_id: string | null
  user_agent: string | null
  context: Record<string, unknown> | null
  created_at: string
}

interface LogStats {
  errorCount: number
  warnCount: number
  infoCount: number
  totalToday: number
}

const LEVEL_CONFIG: Record<LogLevel, {
  icon: typeof AlertCircle
  label: string
  color: string
  bg: string
}> = {
  error: { icon: AlertCircle, label: 'Error', color: 'text-error', bg: 'bg-error-container text-on-error-container' },
  warn: { icon: AlertTriangle, label: 'Warning', color: 'text-warning', bg: 'bg-warning-container text-on-warning-container' },
  info: { icon: Info, label: 'Info', color: 'text-info', bg: 'bg-info-container text-on-info-container' },
  debug: { icon: Code, label: 'Debug', color: 'text-on-surface-variant', bg: 'bg-surface-container text-on-surface-variant' },
  trace: { icon: Code, label: 'Trace', color: 'text-on-surface-variant/50', bg: 'bg-surface-container-low text-on-surface-variant' },
}

export default function AdminLogsPage() {
  const [stats, setStats] = useState<LogStats | null>(null)
  const [level, setLevel] = useState<LogLevel | ''>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedLog, setSelectedLog] = useState<AppLog | null>(null)

  // Dung useAdminList thay custom fetch — giam ~30 dong boilerplate
  const {
    items: logs, meta, page, loading, error,
    goToPage, refresh, isEmpty,
  } = useAdminList<AppLog>({
    endpoint: '/logs',
    limit: 50,
    params: {
      level: level || undefined,
      search: search || undefined,
    },
  })

  // Stats — separate endpoint
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/logs/stats')
      setStats((res as any).data)
    } catch {}
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const clearFilters = () => {
    setLevel('')
    setSearch('')
    setSearchInput('')
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-headline-lg text-on-surface">System Log</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Theo dõi lỗi, cảnh báo và thông tin hệ thống
          </p>
        </div>
        <button
          onClick={() => { refresh(); fetchStats() }}
          disabled={loading}
          className="rounded-xl p-2.5 min-h-[44px] min-w-[44px] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
          aria-label="Làm mới"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Error" value={stats.errorCount} color="error" />
          <StatCard label="Warning" value={stats.warnCount} color="warning" />
          <StatCard label="Info" value={stats.infoCount} color="info" />
          <StatCard label="Hôm nay" value={stats.totalToday} color="neutral" />
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-surface-container p-1">
          {(['', 'error', 'warn', 'info'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={cn(
                'rounded-lg px-3 py-1.5 min-h-[36px] text-label-md transition-colors',
                level === l
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high',
              )}
            >
              {l === '' ? 'Tất cả' : l === 'error' ? 'Error' : l === 'warn' ? 'Warn' : 'Info'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/50" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo message hoặc endpoint..."
            className="w-full rounded-xl bg-surface-container py-2 pl-10 pr-4 text-body-sm text-on-surface outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
          />
        </form>

        {(level || search) && (
          <button onClick={clearFilters} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-label-md text-on-surface-variant hover:bg-surface-container">
            <X className="h-3.5 w-3.5" /> Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Log list — dung DataStates thay custom loading/error/empty */}
      <div className="mt-4">
        <DataStates loading={loading} error={error} isEmpty={isEmpty} onRetry={refresh} emptyMessage="Không có log nào" minHeight="min-h-[20vh]">
          <div className="space-y-2">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} onClick={() => setSelectedLog(log)} />
            ))}
          </div>
        </DataStates>
      </div>

      {/* Pagination — dung shared Pagination thay custom */}
      <Pagination meta={meta} currentPage={page} onPageChange={goToPage} variant="simple" />

      {/* Detail modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────── */

function StatCard({ label, value, color }: {
  label: string
  value: number
  color: 'error' | 'warning' | 'info' | 'neutral'
}) {
  const colorMap = {
    error: 'bg-error/5 text-error',
    warning: 'bg-warning/5 text-warning',
    info: 'bg-info/5 text-info',
    neutral: 'bg-on-surface/5 text-on-surface',
  }

  return (
    <div className={cn('rounded-2xl p-4', colorMap[color].split(' ')[0])}>
      <p className={cn('font-body text-headline-md font-bold', colorMap[color].split(' ')[1])}>
        {formatNumber(value)}
      </p>
      <p className="mt-0.5 text-body-sm text-on-surface-variant">{label}</p>
    </div>
  )
}

function LogRow({ log, onClick }: { log: AppLog; onClick: () => void }) {
  const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info
  const Icon = config.icon
  const time = formatDateTime(log.created_at)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl bg-surface-container-low/50 p-4 text-left transition-colors hover:bg-surface-container-low"
    >
      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', config.bg)}>
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-body-sm font-medium text-on-surface line-clamp-1">{log.message}</p>
          {log.status_code && (
            <span className={cn(
              'shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold',
              log.status_code >= 500 ? 'bg-error/10 text-error' :
              log.status_code >= 400 ? 'bg-warning/10 text-warning' :
              'bg-surface-container text-on-surface-variant'
            )}>
              {log.status_code}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-on-surface-variant/60">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{time}</span>
          {log.endpoint && <span className="flex items-center gap-1 font-mono"><Globe className="h-3 w-3" />{log.endpoint}</span>}
          {log.ip && <span>{log.ip}</span>}
        </div>
      </div>
    </button>
  )
}

function LogDetailModal({ log, onClose }: { log: AppLog; onClose: () => void }) {
  const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info

  // Escape key de dong — nhat quan voi ConfirmDialog va FormModal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-on-surface/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-4 top-[5%] z-[61] mx-auto max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-ambient-xl sm:inset-x-auto sm:w-full">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface-container-lowest/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.bg)}>
              <config.icon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-headline text-title-md text-on-surface">Chi tiết Log</h2>
              <p className="text-[11px] text-on-surface-variant/50">{log.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <Section label="Message">
            <p className="text-body-md text-on-surface">{log.message}</p>
          </Section>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetaItem icon={Clock} label="Thời gian" value={formatDateTime(log.created_at)} />
            <MetaItem icon={Globe} label="Endpoint" value={log.endpoint || '—'} />
            <MetaItem icon={AlertCircle} label="Status" value={log.status_code ? String(log.status_code) : '—'} />
            <MetaItem icon={User} label="User" value={log.user_id || 'Anonymous'} />
          </div>

          {log.ip && (
            <Section label="IP / User-Agent">
              <p className="text-body-sm text-on-surface">{log.ip}</p>
              {log.user_agent && <p className="mt-1 text-body-sm text-on-surface-variant/60 break-all">{log.user_agent}</p>}
            </Section>
          )}

          {log.stack_trace && (
            <Section label="Stack Trace">
              <pre className="max-h-[300px] overflow-auto rounded-xl bg-on-surface p-4 text-[12px] leading-relaxed text-surface/90 font-mono">
                {log.stack_trace}
              </pre>
            </Section>
          )}

          {log.context && Object.keys(log.context).length > 0 && (
            <Section label="Request Context">
              <pre className="max-h-[200px] overflow-auto rounded-xl bg-surface-container p-4 text-[12px] leading-relaxed text-on-surface font-mono">
                {JSON.stringify(log.context, null, 2)}
              </pre>
            </Section>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-label-md uppercase tracking-wider text-on-surface-variant/50">{label}</p>
      {children}
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }: {
  icon: typeof Clock; label: string; value: string
}) {
  return (
    <div className="rounded-xl bg-surface-container-low p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/50">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-body-sm font-medium text-on-surface truncate" title={value}>
        {value}
      </p>
    </div>
  )
}
