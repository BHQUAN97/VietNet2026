import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dự án nội thất tiêu biểu',
  description:
    'Khám phá các dự án thiết kế nội thất đã hoàn thành bởi đội ngũ VietNet Interior.',
  openGraph: {
    title: 'Dự án nội thất tiêu biểu | VietNet Interior',
    description:
      'Khám phá các dự án thiết kế nội thất đã hoàn thành bởi đội ngũ VietNet Interior.',
  },
  alternates: {
    canonical: 'https://bhquan.site/projects',
  },
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
