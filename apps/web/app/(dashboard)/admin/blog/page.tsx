import { sanityFetch } from '@/lib/sanity/client'
import { BLOG_POSTS_QUERY, BLOG_CATEGORIES_QUERY } from '@/lib/sanity/queries'
import type { SanityBlogPost } from '@/lib/sanity/types'
import BlogPostList from '@/components/admin/BlogPostList'

export default async function AdminBlogPage() {
  let posts: SanityBlogPost[] = []
  let categories: string[] = []
  let sanityConnected = false

  try {
    const [fetchedPosts, fetchedCategories] = await Promise.all([
      sanityFetch({ query: BLOG_POSTS_QUERY, tags: ['blog'] }) as Promise<SanityBlogPost[]>,
      sanityFetch({ query: BLOG_CATEGORIES_QUERY, tags: ['blog'] }) as Promise<string[]>,
    ])
    posts = fetchedPosts || []
    categories = fetchedCategories || []
    sanityConnected = true
  } catch {
    // Sanity not configured — show empty state
  }

  const now = new Date()
  const publishedCount = posts.filter(
    (p) => p.publishedAt && new Date(p.publishedAt) <= now
  ).length
  const featuredCount = posts.filter((p) => p.isFeatured).length

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Blog Manager</h1>
            <p className="text-slate-400">
              {sanityConnected
                ? 'Manage blog posts via Sanity CMS'
                : 'Sanity CMS not connected — set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to enable'}
            </p>
          </div>
          {sanityConnected && (
            <a
              href="https://repmax.sanity.studio/structure/blogPost"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Write New Post
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">article</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{posts.length}</p>
                <p className="text-xs text-slate-400">Total Posts</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{publishedCount}</p>
                <p className="text-xs text-slate-400">Published</p>
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
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">category</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{categories.length}</p>
                <p className="text-xs text-slate-400">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Post List */}
        <BlogPostList posts={posts} categories={categories} />
      </div>
    </div>
  )
}
