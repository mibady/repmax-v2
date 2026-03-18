import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-sanity-webhook-secret')
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const body = await request.json()
    const { _type, slug, audience, category } = body

    if (_type === 'resource') {
      revalidatePath('/resources')
      if (audience) {
        revalidatePath(`/resources/${audience}`)
        if (slug?.current) {
          revalidatePath(`/resources/${audience}/${slug.current}`)
        }
      }
    }

    if (_type === 'blogPost') {
      revalidatePath('/blog')
      if (slug?.current) {
        revalidatePath(`/blog/${slug.current}`)
      }
      if (category) {
        revalidatePath(`/blog/category/${category}`)
      }
    }

    if (_type === 'author') {
      // Revalidate all blog pages since author data is embedded
      revalidatePath('/blog')
    }

    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
