import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/client'
import { BLOG_POSTS_QUERY, BLOG_CATEGORIES_QUERY } from '@/lib/sanity/queries'
import { BlogPostCard } from '@/components/content/BlogPostCard'
import type { SanityBlogPost } from '@/lib/sanity/types'

export const revalidate = 60

const categoryLabels: Record<string, string> = {
  'recruiting-tips': 'Recruiting Tips',
  'training': 'Training',
  'ncaa-news': 'NCAA News',
  'success-stories': 'Success Stories',
  'platform-updates': 'Platform Updates',
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    sanityFetch<string>({ query: BLOG_POSTS_QUERY, tags: ['blogPost'] }) as Promise<SanityBlogPost[]>,
    sanityFetch<string>({ query: BLOG_CATEGORIES_QUERY, tags: ['blogPost'] }) as Promise<string[]>,
  ])

  const featured = posts.find(p => p.isFeatured)
  const rest = posts.filter(p => p._id !== featured?._id)

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">RepMax Blog</h1>
        <p className="text-slate-400 text-lg">Recruiting tips, training advice, and the latest NCAA news.</p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/blog"
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20"
          >
            All
          </Link>
          {categories.map(cat => (
            <Link
              key={cat}
              href={`/blog/category/${cat}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 bg-white/5 border border-white/5 hover:text-white hover:border-white/10 transition-colors"
            >
              {categoryLabels[cat] || cat}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">edit_note</span>
          <h3 className="text-white font-semibold text-lg mb-2">Blog Coming Soon</h3>
          <p className="text-slate-400 text-sm">We&apos;re working on great content. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(featured ? [featured, ...rest] : rest).map(post => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}
