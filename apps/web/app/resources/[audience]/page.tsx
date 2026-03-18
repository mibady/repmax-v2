import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity/client'
import { RESOURCES_BY_AUDIENCE_QUERY } from '@/lib/sanity/queries'
import { ResourceCard } from '@/components/content/ResourceCard'
import type { SanityResource } from '@/lib/sanity/types'
import type { Metadata } from 'next'

const validAudiences = ['parents', 'athletes'] as const
type Audience = typeof validAudiences[number]

const audienceLabels: Record<Audience, { title: string; description: string }> = {
  parents: {
    title: 'Parent Resources',
    description: 'NCAA eligibility, recruiting rules, financial aid, and everything parents need to know.',
  },
  athletes: {
    title: 'Athlete Resources',
    description: 'Training tips, recruiting strategies, and guides to help you get recruited.',
  },
}

export async function generateMetadata(
  { params }: { params: Promise<{ audience: string }> }
): Promise<Metadata> {
  const { audience } = await params
  const label = audienceLabels[audience as Audience]
  if (!label) return { title: 'Resources | RepMax' }
  return {
    title: `${label.title} | RepMax`,
    description: label.description,
  }
}

export default async function AudienceResourcesPage(
  { params }: { params: Promise<{ audience: string }> }
) {
  const { audience } = await params

  if (!validAudiences.includes(audience as Audience)) {
    notFound()
  }

  const label = audienceLabels[audience as Audience]
  const resources = await sanityFetch<string>({
    query: RESOURCES_BY_AUDIENCE_QUERY,
    params: { audience },
    tags: ['resource'],
  }) as SanityResource[]

  // Group by category
  const categories = [...new Set(resources.map(r => r.category))]

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <Link href="/resources" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        All Resources
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">{label.title}</h1>
        <p className="text-slate-400">{label.description}</p>
      </div>

      {categories.length > 0 ? (
        categories.map(cat => {
          const catResources = resources.filter(r => r.category === cat)
          const catLabel = cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          return (
            <section key={cat} className="mb-10">
              <h2 className="text-lg font-bold text-white mb-4 capitalize">{catLabel}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catResources.map(r => <ResourceCard key={r._id} resource={r} />)}
              </div>
            </section>
          )
        })
      ) : (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">library_books</span>
          <h3 className="text-white font-semibold text-lg mb-2">No Resources Yet</h3>
          <p className="text-slate-400 text-sm">Resources for {audience} are coming soon.</p>
        </div>
      )}
    </main>
  )
}
