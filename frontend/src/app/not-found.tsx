import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-label text-label-lg uppercase tracking-label-wide text-on-surface-variant">
        404
      </p>
      <h1 className="mt-4 font-headline text-display-md text-primary">
        Không tìm thấy trang
      </h1>
      <p className="mt-4 max-w-md text-body-lg text-on-surface-variant">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div className="mt-8">
        <Link href="/">
          <Button variant="primary" size="lg">
            Quay về trang chủ
          </Button>
        </Link>
      </div>
    </PageContainer>
  )
}
