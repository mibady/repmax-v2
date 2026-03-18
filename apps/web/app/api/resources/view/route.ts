import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { resourceId, resourceType, category, audience } = await request.json()

    if (!resourceId || !resourceType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Use service role for fire-and-forget insert (user may be anonymous)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Fire-and-forget — don't block on result
    supabase
      .from('resource_views')
      .insert({
        sanity_resource_id: resourceId,
        resource_type: resourceType,
        category: category || null,
        audience: audience || null,
      })
      .then(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
