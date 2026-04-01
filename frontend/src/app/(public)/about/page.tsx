import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Shield, TreePine, CheckCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description:
    'VietNet Interior - Công ty thiết kế và thi công nội thất cao cấp với hơn 15 năm kinh nghiệm. Chất lượng gỗ nhập khẩu, vật liệu an toàn, bảo hành dài hạn.',
  alternates: {
    canonical: 'https://bhquan.site/about',
  },
  openGraph: {
    title: 'Giới thiệu | VietNet Interior',
    description:
      'VietNet Interior - Công ty thiết kế và thi công nội thất cao cấp với hơn 15 năm kinh nghiệm.',
  },
}

const stats = [
  { target: 150, suffix: '+', label: 'Dự án hoàn thành' },
  { target: 15, suffix: '+', label: 'Năm kinh nghiệm' },
  { target: 500, suffix: '+', label: 'Khách hàng tin tưởng' },
  { target: 12, suffix: '', label: 'Giải thưởng' },
]

const COMMITMENT_ICONS = [TreePine, Shield, CheckCheck]

const commitments = [
  {
    title: 'Gỗ nhập khẩu chất lượng cao',
    description:
      'Sử dụng gỗ tự nhiên nhập khẩu từ các nước có chứng chỉ FSC, đảm bảo nguồn gốc rõ ràng và chất lượng vượt trội.',
  },
  {
    title: 'Vật liệu an toàn, không độc hại',
    description:
      'Tất cả vật liệu sử dụng đều đạt chuẩn E1/E0, không chứa formaldehyde vượt mức cho phép, an toàn cho sức khỏe gia đình.',
  },
  {
    title: 'Kiểm soát chất lượng 100%',
    description:
      'Quy trình QA nghiêm ngặt từ khâu thiết kế, sản xuất đến lắp đặt. Mỗi sản phẩm đều được kiểm tra trước khi bàn giao.',
  },
]

const warrantyData = [
  { product: 'Gỗ tự nhiên', period: '36 tháng' },
  { product: 'Gỗ công nghiệp', period: '24 tháng' },
  { product: 'Phụ kiện (bản lề, ray trượt...)', period: '12 tháng' },
]

export default function AboutPage() {
  return (
    <>
      {/* Company Story */}
      <section className="bg-surface py-16 md:py-24">
        <PageContainer>
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
              Về chúng tôi
            </p>
            <h1 className="mt-4 font-headline text-headline-lg text-gradient-primary md:text-display-md">
              Kiến tạo không gian sống tinh tế
            </h1>
            <span className="deco-line deco-line-center mt-5" />
            <p className="mt-8 font-body text-body-md leading-relaxed text-on-surface-variant md:text-body-lg">
              VietNet Interior được thành lập với sứ mệnh mang đến những không gian nội thất
              cao cấp, phản ánh cá tính và phong cách sống của mỗi gia chủ. Chúng tôi tin
              rằng ngôi nhà không chỉ là nơi để ở, mà còn là nơi lưu giữ những giá trị và
              cảm xúc của gia đình.
            </p>
            <p className="mt-5 font-body text-body-md leading-relaxed text-on-surface-variant md:text-body-lg">
              Với hơn 15 năm kinh nghiệm, đội ngũ kiến trúc sư và thợ tay nghề cao của chúng
              tôi đã hoàn thành hàng trăm dự án — từ căn hộ chung cư đến biệt thự, từ không
              gian làm việc đến showroom thương mại. Mỗi dự án là một câu chuyện thiết kế
              riêng biệt, được thực hiện với sự tận tâm và chú ý từng chi tiết.
            </p>
          </ScrollReveal>

          {/* Mission / Vision */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
            <ScrollReveal direction="left">
              <div className="relative rounded-2xl bg-surface-container-low p-6 md:p-8">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                  <span className="font-headline text-title-md text-primary">M</span>
                </div>
                <h2 className="font-headline text-headline-sm text-primary">Sứ mệnh</h2>
                <p className="mt-3 font-body text-body-sm leading-relaxed text-on-surface-variant md:text-body-md">
                  Kiến tạo những không gian sống bền vững, thẩm mỹ và tối ưu công năng — nơi
                  mỗi gia đình cảm nhận được sự an yêu và hạnh phúc mỗi ngày.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="relative rounded-2xl bg-surface-container-low p-6 md:p-8">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5">
                  <span className="font-headline text-title-md text-primary">V</span>
                </div>
                <h2 className="font-headline text-headline-sm text-primary">Tầm nhìn</h2>
                <p className="mt-3 font-body text-body-sm leading-relaxed text-on-surface-variant md:text-body-md">
                  Trở thành thương hiệu nội thất được tin tưởng hàng đầu tại Việt Nam, nổi tiếng
                  với chất lượng vượt trội và dịch vụ trọn gói từ thiết kế đến thi công.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </PageContainer>
      </section>

      {/* Stats Counter */}
      <section className="relative overflow-hidden bg-primary-container py-16 md:py-20">
        {/* Decorative circles */}
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-on-primary/[0.04]" />
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-on-primary/[0.04]" />

        <PageContainer className="relative">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
            {stats.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 0.1} className="text-center">
                <AnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  className="font-headline text-headline-lg text-on-primary md:text-display-md"
                />
                <p className="mt-2 font-label text-label-md uppercase tracking-[0.06em] text-on-primary/60">
                  {stat.label}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Quality Commitment */}
      <section className="bg-surface py-16 md:py-24">
        <PageContainer>
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
              Cam kết chất lượng
            </p>
            <h2 className="mt-3 font-headline text-headline-md text-on-surface md:text-headline-lg">
              Chất lượng là nền tảng của mọi dự án
            </h2>
            <span className="deco-line deco-line-center mt-4" />
          </ScrollReveal>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {commitments.map((item, index) => {
              const Icon = COMMITMENT_ICONS[index]
              return (
                <ScrollReveal key={item.title} delay={index * 0.12}>
                  <div className="card-premium rounded-2xl bg-surface-container-low p-6 md:p-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 font-headline text-headline-sm text-on-surface">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-body text-body-sm leading-relaxed text-on-surface-variant md:text-body-md">
                      {item.description}
                    </p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </PageContainer>
      </section>

      {/* Warranty Policy */}
      <section className="bg-surface-container-low py-16 md:py-24">
        <PageContainer>
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="font-label text-label-md uppercase tracking-[0.08em] text-primary/70">
              Chính sách bảo hành
            </p>
            <h2 className="mt-3 font-headline text-headline-md text-on-surface md:text-headline-lg">
              An tâm với bảo hành dài hạn
            </h2>
            <p className="mt-4 font-body text-body-md text-on-surface-variant md:text-body-lg">
              Chúng tôi cam kết bảo hành sản phẩm theo từng loại vật liệu, đảm bảo quyền lợi
              tối đa cho khách hàng.
            </p>
            <span className="deco-line deco-line-center mt-5" />
          </ScrollReveal>

          <ScrollReveal className="mx-auto mt-10 max-w-2xl">
            <div className="overflow-hidden rounded-2xl bg-surface shadow-ambient-sm">
              <div className="bg-surface-container px-5 py-3 md:px-8">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-body-md font-semibold text-on-surface">
                    Loại sản phẩm
                  </span>
                  <span className="font-headline text-body-md font-semibold text-on-surface">
                    Thời gian bảo hành
                  </span>
                </div>
              </div>
              <div className="divide-y divide-surface-container-high">
                {warrantyData.map((row) => (
                  <div
                    key={row.product}
                    className="flex items-center justify-between px-5 py-4 transition-colors duration-200 hover:bg-surface-container-low md:px-8"
                  >
                    <span className="font-body text-body-md text-on-surface">
                      {row.product}
                    </span>
                    <span className="font-headline text-title-md text-primary">
                      {row.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </PageContainer>
      </section>
    </>
  )
}
