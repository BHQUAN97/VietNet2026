import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  description:
    'Tìm kiếm dự án, sản phẩm và bài viết trên VietNet Interior.',
  openGraph: {
    title: 'Tìm kiếm | VietNet Interior',
    description:
      'Tìm kiếm dự án, sản phẩm và bài viết trên VietNet Interior.',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
