'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProjectEditor from '@/components/admin/ProjectEditor'
import { Loader2 } from 'lucide-react'

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

  return <ProjectEditor projectId={id} />
}

export default function ProjectEditorPage() {
  return (
    <Suspense fallback={<EditorLoader />}>
      <EditorWrapper />
    </Suspense>
  )
}
