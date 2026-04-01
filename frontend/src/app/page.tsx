import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { organizationJsonLd } from '@/lib/jsonld'
import { DEFAULT_HOMEPAGE_CONFIG } from '@/lib/default-homepage'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import type { PageConfigData } from '@/types'

import { getServerApiUrl } from '@/lib/api-url'

const API_URL = getServerApiUrl()

export const metadata: Metadata = {
  title: 'VietNet Interior | Nội thất cao cấp',
  description:
    'Nội thất cao cấp cho không gian sống tinh tế. Thiết kế - Thi công - Nội thất trọn gói.',
  alternates: {
    canonical: 'https://bhquan.site',
  },
}

async function getHomepageConfig(isDraft: boolean): Promise<PageConfigData> {
  try {
    const previewSecret = process.env.PREVIEW_SECRET || process.env.REVALIDATE_SECRET || ''
    // Draft mode: fetch draft via preview endpoint, otherwise fetch published
    const endpoint = isDraft
      ? `${API_URL}/pages/homepage/preview?secret=${encodeURIComponent(previewSecret)}`
      : `${API_URL}/pages/homepage/published`
    const res = await fetch(endpoint, {
      next: isDraft ? { revalidate: 0 } : { revalidate: 60, tags: ['homepage'] },
    })
    if (!res.ok) return DEFAULT_HOMEPAGE_CONFIG
    const json = await res.json()
    // draft endpoint returns full PageConfig, published returns just the config
    const config = isDraft
      ? (json.data?.config_draft as PageConfigData | null)
      : (json.data as PageConfigData | null)
    if (!config || !config.sections || config.sections.length === 0) {
      return DEFAULT_HOMEPAGE_CONFIG
    }
    return config
  } catch {
    return DEFAULT_HOMEPAGE_CONFIG
  }
}

export default async function HomePage() {
  const { isEnabled: isDraft } = draftMode()
  const config = await getHomepageConfig(isDraft)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()),
        }}
      />
      {isDraft && (
        <div className="fixed left-0 right-0 top-0 z-50 bg-warning-bg px-4 py-2 text-center text-sm font-medium text-warning-text">
          Chế độ xem trước (Draft Mode) —{' '}
          <a href="/api/draft/disable" className="underline">
            Thoát xem trước
          </a>
        </div>
      )}
      <SectionRenderer sections={config.sections} />
    </>
  )
}
