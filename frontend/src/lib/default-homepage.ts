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
          'Khám phá không gian sống tinh tế với thiết kế nội thất hiện đại, kết hợp hài hòa giữa phong cách và công năng.',
        label: 'Nội thất cao cấp',
        cta_primary_text: 'Xem dự án',
        cta_primary_link: '/projects',
        cta_secondary_text: 'Tư vấn miễn phí',
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
        label: 'Dự án tiêu biểu',
        title: 'Không gian chúng tôi đã tạo nên',
        limit: 6,
        cta_text: 'Xem tất cả dự án',
        cta_link: '/projects',
      },
    },
    {
      id: 'about-default',
      type: 'about',
      order: 3,
      visible: true,
      config: {
        label: 'Về chúng tôi',
        title: 'Kiến tạo không gian, nâng tầm cuộc sống',
        description:
          'VietNet Interior là đơn vị thiết kế và thi công nội thất cao cấp, chuyên tạo nên những không gian sống tinh tế, hiện đại và đẳng cấp. Chúng tôi cam kết mang đến giải pháp nội thất trọn gói với chất lượng vượt trội.',
        stats: [
          { value: '10+', label: 'Năm kinh nghiệm' },
          { value: '500+', label: 'Dự án hoàn thành' },
          { value: '100%', label: 'Khách hàng hài lòng' },
        ],
      },
    },
    {
      id: 'articles-default',
      type: 'latest_articles',
      order: 4,
      visible: true,
      config: {
        label: 'Tin tức & Cảm hứng',
        title: 'Bài viết mới nhất',
        limit: 3,
      },
    },
    {
      id: 'cta-default',
      type: 'contact_cta',
      order: 5,
      visible: true,
      config: {
        title: 'Sẵn sàng kiến tạo không gian mơ ước?',
        description:
          'Đăng ký tư vấn miễn phí. Đội ngũ chuyên gia của chúng tôi sẵn sàng đồng hành cùng bạn.',
        cta_text: 'Liên hệ tư vấn',
        cta_link: '/contact',
      },
    },
  ],
}
