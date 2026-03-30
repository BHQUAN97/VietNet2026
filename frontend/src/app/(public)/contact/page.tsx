import { PageContainer } from '@/components/layout/PageContainer'
import { ConsultationForm } from '@/components/forms/ConsultationForm'

export const metadata = {
  title: 'Lien he tu van',
  description: 'Dang ky tu van thiet ke noi that mien phi tu VietNet Interior.',
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
          <p className="font-label text-label-lg tracking-label-wide text-primary">
            LIEN HE
          </p>
          <h1 className="mt-3 font-headline text-display-md text-on-surface md:text-display-lg">
            Tu van thiet ke noi that
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            Dang ky tu van mien phi. Doi ngu kien truc su va nha thiet ke cua VietNet Interior
            san sang dong hanh cung ban tao nen khong gian song ly tuong.
          </p>
        </div>

        {/* Form Section */}
        <ConsultationForm />
      </PageContainer>
    </section>
  )
}
