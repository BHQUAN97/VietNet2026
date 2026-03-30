import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Du an noi that tieu bieu | VietNet Interior',
  description:
    'Kham pha cac du an thiet ke noi that da hoan thanh boi doi ngu VietNet Interior.',
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
