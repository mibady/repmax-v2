import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/client'
import { BLOG_POSTS_BY_CATEGORY_QUERY } from '@/lib/sanity/queries'
import { BlogPostCard } from '@/components/content/BlogPostCard'
import type { SanityBlogPost } from '@/lib/sanity/types'
import type { Metadata } from 'next'

export const revalidate = 60

const categoryLabels: Record<string, string> = {
  'recruiting-tips': 'Recruiting Tips',
  'training': 'Training',
  'ncaa-news': 'NCAA News',
  'success-stories': 'Success Stories',
  'platform-updates': 'Platform Updates',
}

export async function generateMetadata(
  { params }: { params: Promise<{ cat: string }> }
): Promise<Metadata> {
  const { cat } = await params
  const label = categoryLabels[cat] || cat
  return {
    title: `${label} | RepMax Blog`,
    description: `Browse ${label} articles on the RepMax blog.`,
  }
}

export default async function BlogCategoryPage(
  { params }: { params: Promise<{ cat: string }> }
) {
  const { cat } = await params
  const label = categoryLabels[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const posts = await sanityFetch<string>({
    query: BLOG_POSTS_BY_CATEGORY_QUERY,
    params: { category: cat },
    tags: ['blogPost'],
  }) as SanityBlogPost[]

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        All Posts
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">{label}</h1>
        <p className="text-slate-400">All blog posts in this category.</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">edit_note</span>
          <h3 className="text-white font-semibold text-lg mb-2">No Posts Yet</h3>
          <p className="text-slate-400 text-sm">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}
