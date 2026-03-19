import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/client'
import { RESOURCES_QUERY } from '@/lib/sanity/queries'
import { ResourceCard } from '@/components/content/ResourceCard'
import type { SanityResource } from '@/lib/sanity/types'

export const revalidate = 60

export default async function AthleteResourcesPage() {
  const resources = await sanityFetch<string>({
    query: RESOURCES_QUERY,
    tags: ['resource'],
  }) as SanityResource[]

  const athleteResources = resources.filter(r => r.audience === 'athlete')
  const parentResources = resources.filter(r => r.audience === 'parent').slice(0, 4)

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/athlete" className="text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Recruiting Resources</h1>
          </div>
          <p className="text-gray-500 text-sm ml-8">
            Guides, tips, and tools to navigate the college recruiting process.
          </p>
        </div>

        {/* Athlete Resources */}
        {athleteResources.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">sports_football</span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">For Athletes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {athleteResources.map(r => <ResourceCard key={r._id} resource={r} />)}
            </div>
          </section>
        )}

        {/* Parent Resources Preview */}
        {parentResources.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[20px]">family_restroom</span>
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">For Parents</h2>
              </div>
              <Link href="/resources/parents" className="text-xs font-semibold text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parentResources.map(r => <ResourceCard key={r._id} resource={r} />)}
            </div>
          </section>
        )}

        {/* Empty State */}
        {resources.length === 0 && (
          <div className="text-center py-16 bg-surface-dark rounded-xl border border-[#333]">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4 block">library_books</span>
            <h3 className="text-white font-semibold text-lg mb-2">Resources Coming Soon</h3>
            <p className="text-slate-400 text-sm">We&apos;re building our resource library. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
