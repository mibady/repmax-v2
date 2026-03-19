'use client'

import { useState } from 'react'
import type { SanityBlogPost } from '@/lib/sanity/types'

interface BlogPostListProps {
  posts: SanityBlogPost[]
  categories: string[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BlogPostList({ posts, categories }: BlogPostListProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filteredPosts =
    activeCategory === 'all'
      ? posts
      : posts.filter((post) => post.category === activeCategory)

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-white/10 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All ({posts.length})
        </button>
        {categories.map((category) => {
          const count = posts.filter((p) => p.category === category).length
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeCategory === category
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {category} ({count})
            </button>
          )
        })}
      </div>

      {/* Posts Table */}
      <div className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
              edit_note
            </span>
            <p className="text-slate-400">No posts found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Author
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                  Published
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
              {filteredPosts.map((post) => (
                <tr key={post._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{post.title}</div>
                    {post.excerpt && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {post.excerpt}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-300 capitalize">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {post.author?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                  </td>
                  <td className="px-6 py-4">
                    {post.isFeatured && (
                      <span className="material-symbols-outlined text-amber-400 text-lg">
                        star
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`https://repmax.sanity.studio/structure/blogPost;${post._id}`}
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
