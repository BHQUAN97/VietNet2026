import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

interface RevalidateBody {
  secret: string
  paths?: string[]
  tags?: string[]
}

// Whitelist cac path/tag duoc phep revalidate — tranh DoS bang revalidate "/" lien tuc
const ALLOWED_PATH_PREFIXES = ['/', '/articles', '/projects', '/catalog', '/about', '/contact']
const ALLOWED_TAG_PATTERN = /^[a-z0-9_-]+(-[a-z0-9_-]+)?$/i
const MAX_ITEMS_PER_REQUEST = 50

function isAllowedPath(p: string): boolean {
  if (typeof p !== 'string' || p.length > 200) return false
  if (!p.startsWith('/')) return false
  if (p.includes('..') || p.includes('\\') || p.includes('//')) return false
  return ALLOWED_PATH_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
}

function isAllowedTag(t: string): boolean {
  return typeof t === 'string' && t.length <= 100 && ALLOWED_TAG_PATTERN.test(t)
}

export async function POST(request: NextRequest) {
  let body: RevalidateBody
  try {
    body = (await request.json()) as RevalidateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const secret =
    process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET
  if (!secret || body.secret !== secret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const paths = Array.isArray(body.paths) ? body.paths.slice(0, MAX_ITEMS_PER_REQUEST) : []
  const tags = Array.isArray(body.tags) ? body.tags.slice(0, MAX_ITEMS_PER_REQUEST) : []

  const revalidated: string[] = []
  const rejected: string[] = []

  for (const path of paths) {
    if (isAllowedPath(path)) {
      revalidatePath(path)
      revalidated.push(`path:${path}`)
    } else {
      rejected.push(`path:${path}`)
    }
  }

  for (const tag of tags) {
    if (isAllowedTag(tag)) {
      revalidateTag(tag)
      revalidated.push(`tag:${tag}`)
    } else {
      rejected.push(`tag:${tag}`)
    }
  }

  return NextResponse.json({
    success: true,
    revalidated,
    rejected,
    timestamp: Date.now(),
  })
}
