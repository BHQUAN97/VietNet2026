import type { PageConfigData } from '@/types'

export const DEFAULT_HOMEPAGE_CONFIG: PageConfigData = {
  sections: [
    {
      id: 'hero-default',
      type: 'hero',
      order: 1,
      visible: true,
      config: {
        title: 'Crafting Silent Elegance.',
        subtitle:
          'VietNet Interior brings the soul of Vietnamese craftsmanship into modern architectural spaces, creating retreats that resonate with warmth and precision.',
        label: 'Architecture & Curation',
        cta_primary_text: 'Begin Your Project',
        cta_primary_link: '/contact',
        cta_secondary_text: 'Explore Catalog',
        cta_secondary_link: '/catalog',
        bg_image_url: null,
      },
    },
    {
      id: 'about-default',
      type: 'about',
      order: 2,
      visible: true,
      config: {
        label: 'The Atelier Philosophy',
        title: 'Design is a dialogue between light and material.',
        description:
          'Founded on the principle of "Meticulous Craft," VietNet Interior transcends traditional design. We curate environments that serve as the silent backdrop to your life\'s most meaningful moments.',
        quote: 'We don\'t just fill rooms; we compose atmospheres.',
        stats: [
          { value: '150+', label: 'Projects Completed' },
          { value: '12', label: 'Design Awards' },
        ],
        images: [],
      },
    },
    {
      id: 'featured-default',
      type: 'featured_projects',
      order: 3,
      visible: true,
      config: {
        label: 'Our Legacy',
        title: 'Featured Projects',
        limit: 3,
        cta_text: 'View Full Portfolio',
        cta_link: '/projects',
      },
    },
    {
      id: 'testimonials-default',
      type: 'testimonials',
      order: 4,
      visible: true,
      config: {
        label: 'Voices of Craft',
        title: 'Client Perspectives',
        items: [
          {
            name: 'Minh Lan Nguyen',
            role: 'Founder, Lan Art House',
            content:
              'VietNet transformed our vision into a space that feels both grand and deeply personal. Their attention to detail in the wood joinery is unlike anything we\'ve seen in the region.',
          },
          {
            name: 'Thomas H.',
            role: 'Architectural Collector',
            content:
              'Professionalism at every stage. They managed the architectural complexities of our hillside retreat with grace and delivered a home that breathes with the landscape.',
          },
        ],
      },
    },
    {
      id: 'cta-default',
      type: 'contact_cta',
      order: 5,
      visible: true,
      config: {
        title: 'Ready to define your space?',
        description:
          'Whether you are starting a new build or looking to curate an existing interior, our experts are here to guide you through the process.',
        cta_text: 'Schedule Consultation',
        cta_link: '/contact',
        phone: '+84 (0) 90 123 4567',
        email: 'atelier@vietnet-interior.com',
        show_form: true,
      },
    },
  ],
}
