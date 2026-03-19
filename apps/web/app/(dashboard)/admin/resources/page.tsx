import { sanityFetch } from '@/lib/sanity/client'
import { RESOURCES_QUERY } from '@/lib/sanity/queries'
import type { SanityResource } from '@/lib/sanity/types'
import ResourceList from '@/components/admin/ResourceList'

export default async function AdminResourcesPage() {
  const resources = (await sanityFetch({
    query: RESOURCES_QUERY,
    tags: ['resources'],
  })) as SanityResource[]

  const parentCount = resources.filter((r) => r.audience === 'parent').length
  const athleteCount = resources.filter((r) => r.audience === 'athlete').length
  const featuredCount = resources.filter((r) => r.featured).length

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Resources Hub</h1>
            <p className="text-slate-400">Manage resources via Sanity CMS</p>
          </div>
          <a
            href="https://repmax.sanity.studio/structure/resource"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Resource
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">library_books</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{resources.length}</p>
                <p className="text-xs text-slate-400">Total Resources</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">family_restroom</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{parentCount}</p>
                <p className="text-xs text-slate-400">Parent</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400">sports_football</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{athleteCount}</p>
                <p className="text-xs text-slate-400">Athlete</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400">star</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{featuredCount}</p>
                <p className="text-xs text-slate-400">Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource List */}
        <ResourceList resources={resources} />
      </div>
    </div>
  )
}
