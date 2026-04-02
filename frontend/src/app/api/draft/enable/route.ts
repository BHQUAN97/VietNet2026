import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') || '/'

  // [C-5] No fallback — require env var to be set
  const previewSecret =
    process.env.PREVIEW_SECRET || process.env.REVALIDATE_SECRET

  // [W-6] Allow access via secret param OR valid admin session cookie
  // Admin session cookie means only authenticated admins can enable draft mode
  const hasValidSecret = previewSecret && secret === previewSecret
  const cookieStore = await cookies()
  const hasAdminSession = !!cookieStore.get('auth_session')?.value

  if (!hasValidSecret && !hasAdminSession) {
    if (!previewSecret) {
      return new Response('Preview secret not configured', { status: 500 })
    }
    return new Response('Invalid secret', { status: 401 })
  }

  // [C-7] Validate slug to prevent open redirect
  // Block protocol-relative URLs (//) and protocol schemes (://), backslash tricks (\)
  const isValidSlug =
    slug.startsWith('/') &&
    !slug.startsWith('//') &&
    !slug.includes('://') &&
    !slug.includes('\\')
  const safeSlug = isValidSlug ? slug : '/'

  const draft = await draftMode()
  draft.enable()
  redirect(safeSlug)
}
