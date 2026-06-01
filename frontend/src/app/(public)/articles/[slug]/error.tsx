'use client'

import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'

export default function ArticleError() {
  return (
    <section className="bg-surface py-16">
      <PageContainer>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="font-label text-label-lg uppercase tracking-label-wide text-error">Lỗi</p>
          <h1 className="mt-4 font-headline text-headline-lg text-on-surface">Không thể tải bài viết</h1>
          <p className="mt-4 max-w-md text-body-lg text-on-surface-variant">
            Đã có lỗi xảy ra. Vui lòng thử lại hoặc quay về danh sách bài viết.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/articles">
              <Button variant="primary" size="lg">Xem tất cả bài viết</Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
