import { Suspense } from 'react'
import type {
  PageSection,
  HeroConfig,
  FeaturedProjectsConfig,
  AboutConfig,
  LatestArticlesConfig,
  ContactCtaConfig,
  TestimonialsConfig,
} from '@/types'
import { HeroSection } from './HeroSection'
import { FeaturedProjectsSection } from './FeaturedProjectsSection'
import { AboutSection } from './AboutSection'
import { LatestArticlesSection } from './LatestArticlesSection'
import { ContactCtaSection } from './ContactCtaSection'
import { TestimonialsSection } from './TestimonialsSection'

interface Props {
  sections: PageSection[]
}

function SectionLoading() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function RenderSection({ section }: { section: PageSection }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection config={section.config as HeroConfig} />
    case 'featured_projects':
      return (
        <Suspense fallback={<SectionLoading />}>
          <FeaturedProjectsSection config={section.config as FeaturedProjectsConfig} />
        </Suspense>
      )
    case 'about':
      return <AboutSection config={section.config as AboutConfig} />
    case 'latest_articles':
      return (
        <Suspense fallback={<SectionLoading />}>
          <LatestArticlesSection config={section.config as LatestArticlesConfig} />
        </Suspense>
      )
    case 'contact_cta':
      return <ContactCtaSection config={section.config as ContactCtaConfig} />
    case 'testimonials':
      return <TestimonialsSection config={section.config as TestimonialsConfig} />
    default:
      return null
  }
}

export function SectionRenderer({ sections }: Props) {
  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {visibleSections.map((section) => (
        <RenderSection key={section.id} section={section} />
      ))}
    </>
  )
}
