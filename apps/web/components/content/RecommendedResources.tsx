'use client'

import Link from 'next/link'
import { useResourceRecommendations } from '@/lib/hooks/use-resource-recommendations'

export function RecommendedResources() {
  const { resources, isLoading } = useResourceRecommendations()

  if (isLoading) {
    return (
      <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">auto_stories</span>
          <h3 className="font-bold text-white">Recommended Resources</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (resources.length === 0) return null

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5">
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_stories</span>
          Recommended Resources
        </h3>
        <Link
          href="/resources"
          className="text-xs font-semibold text-primary hover:text-primary/80"
        >
          View All
        </Link>
      </div>
      <div className="divide-y divide-white/5">
        {resources.map(r => {
          const icon = r.icon || 'article'
          const iconColor = r.iconColor || 'bg-blue-500/20 text-blue-400'
          const audiencePath = r.audience === 'parent' ? 'parents' : 'athletes'
          const href = r.externalUrl || `/resources/${audiencePath}/${r.slug.current}`
          const isExternal = !!r.externalUrl

          return (
            <Link
              key={r._id}
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className={`size-10 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.title}</p>
                <p className="text-xs text-slate-500 truncate">{r.description}</p>
              </div>
              <span className="material-symbols-outlined text-slate-600 text-[18px] flex-shrink-0">
                {isExternal ? 'open_in_new' : 'chevron_right'}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
