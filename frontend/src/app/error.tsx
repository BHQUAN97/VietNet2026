'use client'

import { useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-label text-label-lg uppercase tracking-label-wide text-error">
        Lỗi hệ thống
      </p>
      <h1 className="mt-4 font-headline text-display-md text-on-surface">
        Đã xảy ra lỗi
      </h1>
      <p className="mt-4 max-w-md text-body-lg text-on-surface-variant">
        Xin lỗi, đã có lỗi xảy ra khi tải trang này. Vui lòng thử lại.
      </p>
      <div className="mt-8">
        <Button variant="primary" size="lg" onClick={reset}>
          Thử lại
        </Button>
      </div>
    </PageContainer>
  )
}
