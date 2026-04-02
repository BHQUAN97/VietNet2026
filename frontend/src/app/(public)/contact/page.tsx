import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
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
    <section className="section-surface">
      <PageContainer>
        <PageHeader
          label="Liên hệ"
          title="Tư Vấn Thiết Kế Nội Thất"
          description="Đăng ký tư vấn miễn phí. Đội ngũ kiến trúc sư và nhà thiết kế của VietNet Interior sẵn sàng đồng hành cùng bạn tạo nên không gian sống lý tưởng."
        />

        {/* Form Section */}
        <ConsultationForm />
      </PageContainer>
    </section>
  )
}
