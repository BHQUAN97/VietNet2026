import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sản phẩm nội thất',
  description:
    'Tìm kiếm sản phẩm và vật liệu nội thất phù hợp với không gian của bạn tại VietNet Interior.',
  openGraph: {
    title: 'Sản phẩm nội thất | VietNet Interior',
    description:
      'Tìm kiếm sản phẩm và vật liệu nội thất phù hợp với không gian của bạn tại VietNet Interior.',
  },
  alternates: {
    canonical: 'https://bhquan.site/catalog',
  },
}

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
