export const SITE_NAME = 'VietNet Interior'
export const SITE_DESCRIPTION = 'Nội thất cao cấp cho không gian sống tinh tế'

export const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Dự án', href: '/projects' },
  { label: 'Danh mục', href: '/catalog' },
  { label: 'Tư vấn', href: '/contact' },
] as const

export const BOTTOM_NAV_ITEMS = [
  { label: 'Trang chủ', href: '/', icon: 'Home' },
  { label: 'Dự án', href: '/projects', icon: 'Briefcase' },
  { label: 'Danh mục', href: '/catalog', icon: 'LayoutGrid' },
  { label: 'Tư vấn', href: '/contact', icon: 'MessageCircle' },
  { label: 'Menu', href: '#menu', icon: 'Menu' },
] as const

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Trang', href: '/admin/pages', icon: 'FileText' },
  { label: 'Dự án', href: '/admin/projects', icon: 'Briefcase' },
  { label: 'Sản phẩm', href: '/admin/products', icon: 'Package' },
  { label: 'Tư vấn', href: '/admin/consultations', icon: 'MessageCircle' },
  { label: 'Phân tích', href: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Người dùng', href: '/admin/users', icon: 'Users' },
  { label: 'Cài đặt', href: '/admin/settings', icon: 'Settings' },
] as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
