import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { client as sanityClient } from '@/lib/sanity/client'
import { RESOURCES_FOR_RECS_QUERY } from '@/lib/sanity/queries'
import type { SanityResource } from '@/lib/sanity/types'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch all resources from Sanity (shared across parent + athlete)
    const resources = await sanityClient.fetch(RESOURCES_FOR_RECS_QUERY) as SanityResource[]

    if (!user || resources.length === 0) {
      // No personalization — return featured + recent
      const recs = resources
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        .slice(0, 4)
      return NextResponse.json(recs)
    }

    // Get user's viewed categories for personalization
    const { data: views } = await supabase
      .from('resource_views')
      .select('sanity_resource_id, category')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(50)

    const viewedIds = new Set(views?.map(v => v.sanity_resource_id) || [])
    const categoryCounts: Record<string, number> = {}
    views?.forEach(v => {
      if (v.category) {
        categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1
      }
    })

    // Score resources: featured > category affinity > recency, exclude viewed
    const scored = resources
      .filter(r => !viewedIds.has(r._id))
      .map(r => {
        let score = 0
        if (r.featured) score += 10
        if (r.category && categoryCounts[r.category]) {
          score += categoryCounts[r.category] * 2
        }
        // Recency bonus
        if (r.publishedAt) {
          const daysOld = (Date.now() - new Date(r.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
          score += Math.max(0, 5 - daysOld / 30)
        }
        return { resource: r, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(s => s.resource)

    // If not enough unviewed, backfill with featured
    if (scored.length < 3) {
      const backfill = resources
        .filter(r => !scored.find(s => s._id === r._id))
        .slice(0, 4 - scored.length)
      scored.push(...backfill)
    }

    return NextResponse.json(scored)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
