import type { BadgeProps } from '@/components/ui/Badge'

/**
 * Cấu hình trạng thái thống nhất cho toàn bộ admin
 * Mỗi status map sang: label hiển thị + badge variant + dot indicator
 */

type StatusEntry = {
  label: string
  variant: BadgeProps['variant']
  dot?: boolean
}

// ── Consultation Status ──────────────────────────────────────
export const CONSULTATION_STATUS: Record<string, StatusEntry> = {
  new:       { label: 'Mới',          variant: 'warning',  dot: true },
  contacted: { label: 'Đã liên hệ',  variant: 'info' },
  scheduled: { label: 'Đã hẹn',      variant: 'tertiary' },
  completed: { label: 'Hoàn thành',   variant: 'success' },
  cancelled: { label: 'Đã hủy',      variant: 'neutral' },
}

// ── User Status ──────────────────────────────────────────────
export const USER_STATUS: Record<string, StatusEntry> = {
  active:   { label: 'Hoạt động', variant: 'success', dot: true },
  inactive: { label: 'Tạm dừng', variant: 'warning' },
  banned:   { label: 'Đã khóa',  variant: 'error' },
}

// ── User Role ────────────────────────────────────────────────
export const USER_ROLE: Record<string, StatusEntry> = {
  super_admin: { label: 'Super Admin', variant: 'primary' },
  admin:       { label: 'Admin',       variant: 'primary-container' },
  editor:      { label: 'Editor',      variant: 'secondary' },
  viewer:      { label: 'Viewer',      variant: 'neutral' },
}

// ── Article Status ───────────────────────────────────────────
export const ARTICLE_STATUS: Record<string, StatusEntry> = {
  draft:     { label: 'Nháp',       variant: 'neutral' },
  published: { label: 'Đã đăng',   variant: 'success', dot: true },
  archived:  { label: 'Lưu trữ',   variant: 'neutral' },
}

// ── Project Status ───────────────────────────────────────────
export const PROJECT_STATUS: Record<string, StatusEntry> = {
  draft:       { label: 'Nháp',          variant: 'neutral' },
  in_progress: { label: 'Đang thi công', variant: 'info', dot: true },
  completed:   { label: 'Hoàn thành',    variant: 'success' },
  featured:    { label: 'Nổi bật',       variant: 'primary' },
}

// ── Product Status ───────────────────────────────────────────
export const PRODUCT_STATUS: Record<string, StatusEntry> = {
  draft:        { label: 'Nháp',       variant: 'neutral' },
  active:       { label: 'Đang bán',   variant: 'success', dot: true },
  out_of_stock: { label: 'Hết hàng',   variant: 'warning' },
  discontinued: { label: 'Ngừng bán',  variant: 'error' },
}
