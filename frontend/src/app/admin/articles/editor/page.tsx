'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import ArticleEditor — no SSR for TipTap (reduces admin bundle ~300KB)
const ArticleEditor = dynamic(() => import('@/components/admin/ArticleEditor'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

function EditorLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

function EditorWrapper() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || undefined

  return <ArticleEditor articleId={id} />
}

export default function ArticleEditorPage() {
  return (
    <Suspense fallback={<EditorLoader />}>
      <EditorWrapper />
    </Suspense>
  )
}
