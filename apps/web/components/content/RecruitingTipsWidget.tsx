'use client'

import Link from 'next/link'
import { useResourceRecommendations } from '@/lib/hooks/use-resource-recommendations'

export function RecruitingTipsWidget() {
  const { resources, isLoading } = useResourceRecommendations()

  if (isLoading) {
    return (
      <div className="bg-surface-dark rounded-xl border border-[#333] p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          <h3 className="font-bold text-white text-sm uppercase tracking-wider text-text-muted">Recruiting Tips</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (resources.length === 0) return null

  return (
    <div className="bg-surface-dark rounded-xl border border-[#333]">
      <div className="p-5 border-b border-[#333] flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          Recruiting Tips
        </h3>
        <Link
          href="/resources"
          className="text-xs font-semibold text-primary hover:text-primary/80"
        >
          View All
        </Link>
      </div>
      <div className="divide-y divide-[#333]">
        {resources.slice(0, 3).map(r => {
          const icon = r.icon || 'article'
          const audiencePath = r.audience === 'parent' ? 'parents' : 'athletes'
          const href = r.externalUrl || `/resources/${audiencePath}/${r.slug.current}`
          const isExternal = !!r.externalUrl

          return (
            <Link
              key={r._id}
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group"
            >
              <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">{r.title}</p>
                <p className="text-xs text-text-muted truncate">{r.description}</p>
              </div>
              <span className="material-symbols-outlined text-text-muted text-[16px] flex-shrink-0">chevron_right</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
