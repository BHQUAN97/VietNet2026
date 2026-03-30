import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

export const metadata: Metadata = {
  title: 'Gioi thieu',
  description:
    'VietNet Interior - Cong ty thiet ke va thi cong noi that cao cap voi hon 15 nam kinh nghiem. Chat luong go nhap khau, vat lieu an toan, bao hanh dai han.',
  alternates: {
    canonical: 'https://bhquan.site/about',
  },
  openGraph: {
    title: 'Gioi thieu | VietNet Interior',
    description:
      'VietNet Interior - Cong ty thiet ke va thi cong noi that cao cap voi hon 15 nam kinh nghiem.',
  },
}

const stats = [
  { target: 150, suffix: '+', label: 'Du an hoan thanh' },
  { target: 15, suffix: '+', label: 'Nam kinh nghiem' },
  { target: 500, suffix: '+', label: 'Khach hang tin tuong' },
  { target: 12, suffix: '', label: 'Giai thuong' },
]

const commitments = [
  {
    title: 'Go nhap khau chat luong cao',
    description:
      'Su dung go tu nhien nhap khau tu cac nuoc co chung chi FSC, dam bao nguon goc ro rang va chat luong vuot troi.',
    icon: '🪵',
  },
  {
    title: 'Vat lieu an toan, khong doc hai',
    description:
      'Tat ca vat lieu su dung deu dat chuan E1/E0, khong chua formaldehyde vuot muc cho phep, an toan cho suc khoe gia dinh.',
    icon: '🛡️',
  },
  {
    title: 'Kiem soat chat luong 100%',
    description:
      'Quy trinh QA nghiem ngat tu khau thiet ke, san xuat den lap dat. Moi san pham deu duoc kiem tra truoc khi ban giao.',
    icon: '✅',
  },
]

const warrantyData = [
  { product: 'Go tu nhien', period: '36 thang' },
  { product: 'Go cong nghiep', period: '24 thang' },
  { product: 'Phu kien (ban le, ray truot...)', period: '12 thang' },
]

export default function AboutPage() {
  return (
    <>
      {/* ── A6.1: Company Story ── */}
      <section className="bg-surface py-16 md:py-24">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-label text-label-lg uppercase tracking-[0.2em] text-primary">
              Ve chung toi
            </p>
            <h1 className="mt-4 font-headline text-display-md text-on-surface md:text-display-lg">
              Kien tao khong gian song tinh te
            </h1>
            <p className="mt-8 font-body text-body-lg text-on-surface-variant">
              VietNet Interior duoc thanh lap voi su menh mang den nhung khong gian noi that
              cao cap, phan anh ca tinh va phong cach song cua moi gia chu. Chung toi tin
              rang ngoi nha khong chi la noi de o, ma con la noi luu giu nhung gia tri va
              cam xuc cua gia dinh.
            </p>
            <p className="mt-6 font-body text-body-lg text-on-surface-variant">
              Voi hon 15 nam kinh nghiem, doi ngu kien truc su va tho tay nghe cao cua chung
              toi da hoan thanh hang tram du an — tu can ho chung cu den biet thu, tu khong
              gian lam viec den showroom thuong mai. Moi du an la mot cau chuyen thiet ke
              rieng biet, duoc thuc hien voi su tan tam va chu y tung chi tiet.
            </p>
          </div>

          {/* Mission / Vision */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-surface-container-low p-8 md:p-10">
              <h2 className="font-headline text-headline-sm text-primary">Su menh</h2>
              <p className="mt-4 font-body text-body-md text-on-surface-variant">
                Kien tao nhung khong gian song ben vung, tham my va toi uu cong nang — noi
                moi gia dinh cam nhan duoc su an yeu va hanh phuc moi ngay.
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-8 md:p-10">
              <h2 className="font-headline text-headline-sm text-primary">Tam nhin</h2>
              <p className="mt-4 font-body text-body-md text-on-surface-variant">
                Tro thanh thuong hieu noi that duoc tin tuong hang dau tai Viet Nam, noi tieng
                voi chat luong vuot troi va dich vu tron goi tu thiet ke den thi cong.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── A6.3: Stats Counter ── */}
      <section className="bg-surface-container py-16 md:py-20">
        <PageContainer>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <AnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  className="font-headline text-display-md text-primary md:text-display-lg"
                />
                <p className="mt-2 font-label text-label-lg uppercase tracking-[0.2em] text-on-surface-variant">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── A6.4: Quality Commitment ── */}
      <section className="bg-surface py-16 md:py-24">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-label text-label-lg uppercase tracking-[0.2em] text-primary">
              Cam ket chat luong
            </p>
            <h2 className="mt-4 font-headline text-headline-lg text-on-surface md:text-display-md">
              Chat luong la nen tang cua moi du an
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
            {commitments.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-surface-container-low p-8 transition-shadow duration-300 hover:shadow-ambient"
              >
                <span className="text-4xl" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="mt-4 font-headline text-headline-sm text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-3 font-body text-body-md text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── A6.5: Warranty Policy ── */}
      <section className="bg-surface-container-low py-16 md:py-24">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-label text-label-lg uppercase tracking-[0.2em] text-primary">
              Chinh sach bao hanh
            </p>
            <h2 className="mt-4 font-headline text-headline-lg text-on-surface md:text-display-md">
              An tam voi bao hanh dai han
            </h2>
            <p className="mt-4 font-body text-body-lg text-on-surface-variant">
              Chung toi cam ket bao hanh san pham theo tung loai vat lieu, dam bao quyen loi
              toi da cho khach hang.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl bg-surface">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container">
                  <th className="px-6 py-4 text-left font-headline text-title-md text-on-surface">
                    Loai san pham
                  </th>
                  <th className="px-6 py-4 text-right font-headline text-title-md text-on-surface">
                    Thoi gian bao hanh
                  </th>
                </tr>
              </thead>
              <tbody>
                {warrantyData.map((row, index) => (
                  <tr
                    key={row.product}
                    className={
                      index < warrantyData.length - 1
                        ? 'bg-surface'
                        : 'bg-surface'
                    }
                  >
                    <td className="px-6 py-5 font-body text-body-lg text-on-surface">
                      {row.product}
                    </td>
                    <td className="px-6 py-5 text-right font-headline text-title-lg text-primary">
                      {row.period}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageContainer>
      </section>
    </>
  )
}
