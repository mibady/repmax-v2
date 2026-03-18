import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { SanityAuthor } from '@/lib/sanity/types'

interface AuthorBioProps {
  author: SanityAuthor
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#1F1F22] rounded-xl border border-white/5">
      {author.avatar?.asset?._ref ? (
        <Image
          src={urlFor(author.avatar).width(48).height(48).url()}
          alt={author.name}
          width={48}
          height={48}
          className="rounded-full"
        />
      ) : (
        <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
          {author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      )}
      <div>
        <p className="text-white font-semibold text-sm">{author.name}</p>
        {author.role && <p className="text-slate-500 text-xs">{author.role}</p>}
        {author.bio && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{author.bio}</p>}
      </div>
    </div>
  )
}
