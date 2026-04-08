export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ─── Auth ───────────────────────────────────────────────────────

export interface User {
  id: string
  full_name: string
  email: string
  role: 'super_admin' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive' | 'banned'
  phone?: string | null
  avatar_url?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  user: User
  accessToken: string
}

// ─── Categories ─────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  type: 'project' | 'product' | 'article' | 'material'
  parent_id?: string | null
  display_order: number
  is_active: boolean
  children?: Category[]
}

// ─── Projects ───────────────────────────────────────────────────

export interface Project {
  id: string
  title: string
  slug: string
  description?: string | null
  content?: string | null
  category_id?: string | null
  category?: Category | null
  style?: string | null
  materials?: string[] | null
  area?: string | null
  duration?: string | null
  location?: string | null
  year_completed?: number | null
  cover_image_id?: string | null
  cover_image?: Media | null
  status: 'draft' | 'published'
  published_at?: string | null
  is_featured: boolean
  view_count: number
  display_order: number
  ref_code?: string | null
  seo_title?: string | null
  seo_description?: string | null
  og_image_id?: string | null
  gallery?: ProjectGalleryItem[]
  created_at: string
  updated_at: string
}

export interface ProjectGalleryItem {
  id: string
  media_id: string
  media?: Media
  display_order: number
  caption?: string | null
}

// ─── Products ───────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  category_id?: string | null
  category?: Category | null
  material_type?: string | null
  finish?: string | null
  dimensions?: Record<string, unknown> | null
  price_range?: string | null
  cover_image_id?: string | null
  cover_image?: Media | null
  status: 'draft' | 'published'
  published_at?: string | null
  is_new: boolean
  is_featured: boolean
  display_order: number
  seo_title?: string | null
  seo_description?: string | null
  og_image_id?: string | null
  images?: ProductImageItem[]
  created_at: string
  updated_at: string
}

export interface ProductImageItem {
  id: string
  media_id: string
  media?: Media
  display_order: number
  is_primary: boolean
  caption?: string | null
}

// ─── Media ──────────────────────────────────────────────────────

export interface Media {
  id: string
  original_filename: string
  mime_type: string
  file_size: number
  original_url: string
  thumbnail_url?: string | null
  preview_url?: string | null
  width?: number | null
  height?: number | null
  alt_text?: string | null
  blurhash?: string | null
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

// ─── Consultations ──────────────────────────────────────────────

export interface Consultation {
  id: string
  name: string
  email: string
  phone?: string | null
  project_type?: 'residential' | 'commercial' | 'hospitality' | 'renovation' | 'other' | null
  area?: string | null
  budget_range?: string | null
  message: string
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
  assigned_to?: string | null
  assignee?: User | null
  notes?: string | null
  source?: string | null
  created_at: string
  updated_at: string
}

// ─── Articles ──────────────────────────────────────────────────

export interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  category_id?: string | null
  category?: Category | null
  cover_image_id?: string | null
  cover_image?: Media | null
  status: 'draft' | 'published'
  published_at?: string | null
  is_featured: boolean
  view_count: number
  display_order: number
  seo_title?: string | null
  seo_description?: string | null
  og_image_id?: string | null
  created_at: string
  updated_at: string
}

// ─── Search ─────────────────────────────────────────────────────

export interface SearchResult {
  type: 'project' | 'product' | 'article'
  id: string
  title: string
  slug: string
  description?: string | null
  thumbnail_url?: string | null
  category_name?: string | null
}

// ─── Page Builder ──────────────────────────────────────────────

export type PageSectionType =
  | 'hero'
  | 'featured_projects'
  | 'about'
  | 'latest_articles'
  | 'contact_cta'
  | 'testimonials'
  | 'custom_html'

export interface HeroConfig {
  title: string
  subtitle: string
  label: string
  cta_primary_text: string
  cta_primary_link: string
  cta_secondary_text: string
  cta_secondary_link: string
  /** @deprecated Dung bg_images thay the */
  bg_image_url?: string | null
  /** Danh sach anh nen — 1 anh = static, nhieu anh = auto-slide */
  bg_images?: string[]
}

export interface FeaturedProjectsConfig {
  label: string
  title: string
  limit: number
  cta_text: string
  cta_link: string
}

export interface AboutConfig {
  label: string
  title: string
  description: string
  quote?: string
  stats: Array<{ value: string; label: string }>
  images?: string[]
}

export interface LatestArticlesConfig {
  label: string
  title: string
  limit: number
}

export interface ContactCtaConfig {
  title: string
  description: string
  cta_text: string
  cta_link: string
  phone?: string
  email?: string
  show_form?: boolean
}

export interface TestimonialsConfig {
  label: string
  title: string
  items: Array<{ name: string; role: string; content: string; avatar_url?: string }>
}

export interface CustomHtmlConfig {
  html: string
}

export type PageSectionConfig =
  | HeroConfig
  | FeaturedProjectsConfig
  | AboutConfig
  | LatestArticlesConfig
  | ContactCtaConfig
  | TestimonialsConfig
  | CustomHtmlConfig

export interface PageSection {
  id: string
  type: PageSectionType
  order: number
  visible: boolean
  config: PageSectionConfig
}

export interface PageConfigData {
  sections: PageSection[]
}

export interface PageConfig {
  id: string
  page_slug: string
  config_draft: PageConfigData | null
  config_published: PageConfigData | null
  version: number
  published_at: string | null
  published_by: string | null
  updated_at: string
  updated_by: string | null
}

export interface PageConfigHistory {
  id: string
  page_config_id: string
  config_snapshot: PageConfigData
  version: number
  published_at: string | null
  published_by: string | null
  created_at: string
}

// ─── Notifications ─────────────────────────────────────────────

export interface AppNotification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export interface RealtimeNotification {
  id?: string
  type: string
  title: string
  body: string | null
  link: string | null
  created_at: string | Date
}

// ─── Analytics ──────────────────────────────────────────────────

export interface AnalyticsSummary {
  date: string
  totalViews: number
  topPages: Array<{
    path: string
    views: number
    uniqueVisitors: number
  }>
}

export interface AnalyticsDashboard {
  totalViews: number
  totalUnique: number
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  dailyTrend: Array<{
    date: string
    views: number
    unique: number
  }>
  topPages: Array<{
    path: string
    views: number
    unique: number
  }>
}
