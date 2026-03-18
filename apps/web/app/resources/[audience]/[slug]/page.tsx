import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity/client'
import { RESOURCE_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { ResourceSaveButton } from '@/components/content/ResourceSaveButton'
import { ResourceViewTracker } from '@/components/content/ResourceViewTracker'
import type { SanityResource } from '@/lib/sanity/types'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata(
  { params }: { params: Promise<{ audience: string; slug: string }> }
): Promise<Metadata> {
  const { audience, slug } = await params
  const resource = await sanityFetch<string>({
    query: RESOURCE_BY_SLUG_QUERY,
    params: { slug, audience },
    tags: ['resource'],
  }) as SanityResource | null

  if (!resource) return { title: 'Resource Not Found | RepMax' }
  return {
    title: `${resource.title} | RepMax`,
    description: resource.description,
  }
}

export default async function ResourceDetailPage(
  { params }: { params: Promise<{ audience: string; slug: string }> }
) {
  const { audience, slug } = await params

  const resource = await sanityFetch<string>({
    query: RESOURCE_BY_SLUG_QUERY,
    params: { slug, audience },
    tags: ['resource'],
  }) as SanityResource | null

  if (!resource) notFound()

  const catLabel = resource.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <ResourceViewTracker
        resourceId={resource._id}
        resourceType="resource"
        category={resource.category}
        audience={audience}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
        <span>/</span>
        <Link href={`/resources/${audience}`} className="hover:text-white transition-colors capitalize">{audience}</Link>
        <span>/</span>
        <span className="text-slate-500 truncate">{resource.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            {catLabel}
          </span>
          {resource.readingTime && (
            <span className="text-xs text-slate-500">{resource.readingTime} min read</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{resource.title}</h1>
        <p className="text-slate-400 text-lg">{resource.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-10 pb-8 border-b border-white/5">
        <ResourceSaveButton
          resourceId={resource._id}
          resourceType="resource"
          audience={audience}
        />
        {resource.externalUrl && (
          <a
            href={resource.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-black hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Visit Source
          </a>
        )}
      </div>

      {/* Body */}
      {resource.body && resource.body.length > 0 ? (
        <PortableTextRenderer value={resource.body} />
      ) : (
        resource.externalUrl && (
          <div className="text-center py-12 bg-[#1F1F22] rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-3">open_in_new</span>
            <p className="text-slate-400 mb-4">This resource links to an external site.</p>
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80"
            >
              Open Resource <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        )
      )}
    </main>
  )
}
