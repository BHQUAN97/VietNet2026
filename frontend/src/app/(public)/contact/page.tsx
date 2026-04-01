import { PageContainer } from '@/components/layout/PageContainer'
import { ConsultationForm } from '@/components/forms/ConsultationForm'

export const metadata = {
  title: 'Liên hệ tư vấn',
  description: 'Đăng ký tư vấn thiết kế nội thất miễn phí từ VietNet Interior.',
  alternates: {
    canonical: 'https://bhquan.site/contact',
  },
}

export default function ContactPage() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <PageContainer>
        {/* Page Header */}
        <div className="mb-12 md:mb-16">
          <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
            Liên hệ
          </p>
          <h1 className="mt-3 font-headline text-headline-lg text-gradient-primary md:text-display-md">
            Tư vấn thiết kế nội thất
          </h1>
          <p className="mt-4 max-w-2xl text-body-md leading-relaxed text-on-surface-variant md:text-body-lg">
            Đăng ký tư vấn miễn phí. Đội ngũ kiến trúc sư và nhà thiết kế của VietNet Interior
            sẵn sàng đồng hành cùng bạn tạo nên không gian sống lý tưởng.
          </p>
          <span className="deco-line mt-5" />
        </div>

        {/* Form Section */}
        <ConsultationForm />
      </PageContainer>
    </section>
  )
}
