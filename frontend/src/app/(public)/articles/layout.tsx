import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tin tức & Cảm hứng nội thất',
  description:
    'Cập nhật xu hướng thiết kế nội thất và chia sẻ cảm hứng không gian sống từ VietNet Interior.',
  openGraph: {
    title: 'Tin tức & Cảm hứng nội thất | VietNet Interior',
    description:
      'Cập nhật xu hướng thiết kế nội thất và chia sẻ cảm hứng không gian sống từ VietNet Interior.',
  },
  alternates: {
    canonical: 'https://bhquan.site/articles',
  },
}

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
