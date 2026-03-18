import Link from 'next/link'
import type { SanityResource } from '@/lib/sanity/types'

interface ResourceCardProps {
  resource: SanityResource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const icon = resource.icon || 'article'
  const iconColor = resource.iconColor || 'bg-blue-500/20 text-blue-400'
  const href = resource.externalUrl
    ? resource.externalUrl
    : `/resources/${resource.audience}/${resource.slug.current}`
  const isExternal = !!resource.externalUrl

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`size-12 rounded-lg ${iconColor} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        {resource.featured && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
            Featured
          </span>
        )}
      </div>
      <h3 className="text-white font-semibold mb-2">{resource.title}</h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{resource.description}</p>
      <div className="flex items-center justify-between">
        <Link
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
        >
          {isExternal ? 'Visit Resource' : 'Read More'}
          <span className="material-symbols-outlined text-[16px]">
            {isExternal ? 'open_in_new' : 'arrow_forward'}
          </span>
        </Link>
        {resource.readingTime && (
          <span className="text-xs text-slate-500">{resource.readingTime} min read</span>
        )}
      </div>
    </div>
  )
}
