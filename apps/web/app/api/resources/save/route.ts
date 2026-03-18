import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const resourceId = request.nextUrl.searchParams.get('resourceId')
    if (!resourceId) {
      return NextResponse.json({ saved: false })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ saved: false })
    }

    const { data } = await supabase
      .from('resource_saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('sanity_resource_id', resourceId)
      .maybeSingle()

    return NextResponse.json({ saved: !!data })
  } catch {
    return NextResponse.json({ saved: false })
  }
}

export async function POST(request: Request) {
  try {
    const { resourceId, resourceType, audience } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('resource_saves')
      .insert({
        user_id: user.id,
        sanity_resource_id: resourceId,
        resource_type: resourceType,
        audience: audience || null,
      })

    if (error) {
      // Unique constraint — already saved
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, alreadySaved: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { resourceId } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase
      .from('resource_saves')
      .delete()
      .eq('user_id', user.id)
      .eq('sanity_resource_id', resourceId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
