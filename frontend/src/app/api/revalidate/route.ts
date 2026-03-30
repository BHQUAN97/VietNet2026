import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

interface RevalidateBody {
  secret: string
  paths?: string[]
  tags?: string[]
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RevalidateBody

  const secret =
    process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET
  if (!secret || body.secret !== secret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const revalidated: string[] = []

  if (body.paths?.length) {
    for (const path of body.paths) {
      revalidatePath(path)
      revalidated.push(`path:${path}`)
    }
  }

  if (body.tags?.length) {
    for (const tag of body.tags) {
      revalidateTag(tag)
      revalidated.push(`tag:${tag}`)
    }
  }

  return NextResponse.json({
    success: true,
    revalidated,
    timestamp: Date.now(),
  })
}
