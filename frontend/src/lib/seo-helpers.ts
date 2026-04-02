import { Metadata } from 'next'

interface SeoConfig {
  /** Ten entity (vd: 'Sản phẩm', 'Bài viết', 'Dự án') */
  entityName: string
  /** Base path (vd: '/catalog', '/articles', '/projects') */
  basePath: string
  /** Domain (default: 'https://bhquan.site') */
  domain?: string
  /** OG type (default: 'article') */
  ogType?: 'article' | 'website'
}

/**
 * buildDetailMetadata — tao Metadata chung cho detail pages.
 * Thay the 3+ cho generateMetadata gan y het.
 *
 * Usage:
 * export async function generateMetadata({ params }) {
 *   const { slug } = await params
 *   const item = await serverFetch(`/products/${slug}`, { tags: ['products'] })
 *   return buildDetailMetadata(item, { entityName: 'Sản phẩm', basePath: '/catalog' })
 * }
 */
export function buildDetailMetadata(
  item: any | null,
  config: SeoConfig,
): Metadata {
  const { entityName, basePath, domain = 'https://bhquan.site', ogType = 'article' } = config

  if (!item) {
    return { title: `${entityName} không tồn tại` }
  }

  // Lay title/description tu SEO fields hoac fallback
  const title = item.seo_title || item.title || item.name || entityName
  const description = item.seo_description || item.description || item.excerpt || ''
  const imageUrl = item.og_image?.preview_url || item.cover_image?.preview_url || ''
  const slug = item.slug || ''

  return {
    title,
    description,
    alternates: {
      canonical: `${domain}${basePath}/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: ogType,
      ...(item.published_at ? { publishedTime: item.published_at } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}
