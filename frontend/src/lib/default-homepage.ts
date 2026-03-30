import type { PageConfigData } from '@/types'

export const DEFAULT_HOMEPAGE_CONFIG: PageConfigData = {
  sections: [
    {
      id: 'hero-default',
      type: 'hero',
      order: 1,
      visible: true,
      config: {
        title: 'VietNet Interior',
        subtitle:
          'Kham pha khong gian song tinh te voi thiet ke noi that hien dai, ket hop hai hoa giua phong cach va cong nang.',
        label: 'Noi that cao cap',
        cta_primary_text: 'Xem du an',
        cta_primary_link: '/projects',
        cta_secondary_text: 'Tu van mien phi',
        cta_secondary_link: '/contact',
        bg_image_url: null,
      },
    },
    {
      id: 'featured-default',
      type: 'featured_projects',
      order: 2,
      visible: true,
      config: {
        label: 'Du an tieu bieu',
        title: 'Khong gian chung toi da tao nen',
        limit: 6,
        cta_text: 'Xem tat ca du an',
        cta_link: '/projects',
      },
    },
    {
      id: 'about-default',
      type: 'about',
      order: 3,
      visible: true,
      config: {
        label: 'Ve chung toi',
        title: 'Kien tao khong gian, nang tam cuoc song',
        description:
          'VietNet Interior la don vi thiet ke va thi cong noi that cao cap, chuyen tao nen nhung khong gian song tinh te, hien dai va dang cap. Chung toi cam ket mang den giai phap noi that tron goi voi chat luong vuot troi.',
        stats: [
          { value: '10+', label: 'Nam kinh nghiem' },
          { value: '500+', label: 'Du an hoan thanh' },
          { value: '100%', label: 'Khach hang hai long' },
        ],
      },
    },
    {
      id: 'articles-default',
      type: 'latest_articles',
      order: 4,
      visible: true,
      config: {
        label: 'Tin tuc & Cam hung',
        title: 'Bai viet moi nhat',
        limit: 3,
      },
    },
    {
      id: 'cta-default',
      type: 'contact_cta',
      order: 5,
      visible: true,
      config: {
        title: 'San sang kien tao khong gian mo uoc?',
        description:
          'Dang ky tu van mien phi. Doi ngu chuyen gia cua chung toi san sang dong hanh cung ban.',
        cta_text: 'Lien he tu van',
        cta_link: '/contact',
      },
    },
  ],
}
