import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') || '/'

  const previewSecret =
    process.env.PREVIEW_SECRET || process.env.REVALIDATE_SECRET || 'preview-secret'

  if (secret !== previewSecret) {
    return new Response('Invalid secret', { status: 401 })
  }

  draftMode().enable()
  redirect(slug)
}
