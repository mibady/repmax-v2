import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { SanityBlogPost } from '@/lib/sanity/types'

interface BlogPostCardProps {
  post: SanityBlogPost
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const catLabel = post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors group"
    >
      {/* Cover Image */}
      {post.coverImage?.asset?._ref ? (
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={urlFor(post.coverImage).width(600).height(340).url()}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-[#1F1F22] flex items-center justify-center">
          <span className="material-symbols-outlined text-primary/40 text-5xl">article</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            {catLabel}
          </span>
          {post.isFeatured && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
              Featured
            </span>
          )}
        </div>

        <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar?.asset?._ref ? (
                <Image
                  src={urlFor(post.author.avatar).width(24).height(24).url()}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="size-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                  {post.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <span className="text-xs text-slate-500">{post.author.name}</span>
            </div>
          )}
          {post.publishedAt && (
            <span className="text-xs text-slate-500">
              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
