'use client'

import { useState } from 'react'
import type { SanityResource } from '@/lib/sanity/types'

interface ResourceListProps {
  resources: SanityResource[]
}

type AudienceFilter = 'all' | 'parent' | 'athlete'

export default function ResourceList({ resources }: ResourceListProps) {
  const [activeAudience, setActiveAudience] = useState<AudienceFilter>('all')

  const filteredResources =
    activeAudience === 'all'
      ? resources
      : resources.filter((r) => r.audience === activeAudience)

  const tabs: { label: string; value: AudienceFilter; count: number }[] = [
    { label: 'All', value: 'all', count: resources.length },
    {
      label: 'Parent',
      value: 'parent',
      count: resources.filter((r) => r.audience === 'parent').length,
    },
    {
      label: 'Athlete',
      value: 'athlete',
      count: resources.filter((r) => r.audience === 'athlete').length,
    },
  ]

  return (
    <div>
      {/* Audience Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveAudience(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeAudience === tab.value
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Resources Table */}
      <div className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden">
        {filteredResources.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
              library_books
            </span>
            <p className="text-slate-400">No resources found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Audience
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Reading Time
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Featured
                </th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredResources.map((resource) => (
                <tr key={resource._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{resource.title}</div>
                    {resource.description && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {resource.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        resource.audience === 'parent'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {resource.audience}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-300 capitalize">
                      {resource.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {resource.readingTime ? `${resource.readingTime} min` : '--'}
                  </td>
                  <td className="px-6 py-4">
                    {resource.featured && (
                      <span className="material-symbols-outlined text-amber-400 text-lg">
                        star
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`https://repmax.sanity.studio/structure/resource;${resource._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Edit in Sanity
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
