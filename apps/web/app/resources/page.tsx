import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/client'
import { RESOURCES_QUERY } from '@/lib/sanity/queries'
import { ResourceCard } from '@/components/content/ResourceCard'
import type { SanityResource } from '@/lib/sanity/types'

export const revalidate = 60

export default async function ResourcesHubPage() {
  const resources = await sanityFetch<string>({
    query: RESOURCES_QUERY,
    tags: ['resource'],
  }) as SanityResource[]

  const parentResources = resources.filter(r => r.audience === 'parent').slice(0, 4)
  const athleteResources = resources.filter(r => r.audience === 'athlete').slice(0, 4)

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Recruiting Resources</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Everything you need to navigate the college recruiting process — from NCAA eligibility to training tips.
        </p>
      </div>

      {/* Audience Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <Link
          href="/resources/parents"
          className="bg-[#1F1F22] rounded-xl border border-white/5 p-8 hover:border-primary/30 transition-colors group"
        >
          <div className="size-14 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[28px]">family_restroom</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">For Parents</h2>
          <p className="text-slate-400 text-sm">NCAA eligibility, recruiting rules, financial aid guides, and more to support your athlete.</p>
          <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold mt-4">
            Browse Parent Resources <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </Link>
        <Link
          href="/resources/athletes"
          className="bg-[#1F1F22] rounded-xl border border-white/5 p-8 hover:border-primary/30 transition-colors group"
        >
          <div className="size-14 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[28px]">sports_football</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">For Athletes</h2>
          <p className="text-slate-400 text-sm">Training tips, recruiting strategies, and everything you need to get recruited.</p>
          <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold mt-4">
            Browse Athlete Resources <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </Link>
      </div>

      {/* Parent Resources Preview */}
      {parentResources.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Parent Resources</h2>
            <Link href="/resources/parents" className="text-sm font-semibold text-primary hover:text-primary/80">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parentResources.map(r => <ResourceCard key={r._id} resource={r} />)}
          </div>
        </section>
      )}

      {/* Athlete Resources Preview */}
      {athleteResources.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Athlete Resources</h2>
            <Link href="/resources/athletes" className="text-sm font-semibold text-primary hover:text-primary/80">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {athleteResources.map(r => <ResourceCard key={r._id} resource={r} />)}
          </div>
        </section>
      )}

      {/* Empty state */}
      {resources.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">library_books</span>
          <h3 className="text-white font-semibold text-lg mb-2">Resources Coming Soon</h3>
          <p className="text-slate-400 text-sm">We&apos;re building our resource library. Check back soon!</p>
        </div>
      )}
    </main>
  )
}
