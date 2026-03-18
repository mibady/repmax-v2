import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity/client'
import { BLOG_POST_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { PortableTextRenderer } from '@/components/content/PortableTextRenderer'
import { AuthorBio } from '@/components/content/AuthorBio'
import { ResourceSaveButton } from '@/components/content/ResourceSaveButton'
import { ResourceViewTracker } from '@/components/content/ResourceViewTracker'
import type { SanityBlogPost } from '@/lib/sanity/types'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityFetch<string>({
    query: BLOG_POST_BY_SLUG_QUERY,
    params: { slug },
    tags: ['blogPost'],
  }) as SanityBlogPost | null

  if (!post) return { title: 'Post Not Found | RepMax' }
  return {
    title: `${post.title} | RepMax Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const post = await sanityFetch<string>({
    query: BLOG_POST_BY_SLUG_QUERY,
    params: { slug },
    tags: ['blogPost'],
  }) as SanityBlogPost | null

  if (!post) notFound()

  const catLabel = post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <ResourceViewTracker
        resourceId={post._id}
        resourceType="blog_post"
        category={post.category}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <Link href={`/blog/category/${post.category}`} className="hover:text-white transition-colors">{catLabel}</Link>
        <span>/</span>
        <span className="text-slate-500 truncate">{post.title}</span>
      </div>

      {/* Cover Image */}
      {post.coverImage?.asset?._ref && (
        <div className="aspect-[16/9] relative rounded-xl overflow-hidden mb-8">
          <Image
            src={urlFor(post.coverImage).width(900).height(500).url()}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            {catLabel}
          </span>
          {post.publishedAt && (
            <span className="text-xs text-slate-500">
              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
        {post.excerpt && <p className="text-slate-400 text-lg">{post.excerpt}</p>}
      </div>

      {/* Tags + Save */}
      <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
        <div className="flex flex-wrap gap-2">
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <ResourceSaveButton resourceId={post._id} resourceType="blog_post" />
      </div>

      {/* Body */}
      {post.body && <PortableTextRenderer value={post.body} />}

      {/* Author Bio */}
      {post.author && (
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Written by</p>
          <AuthorBio author={post.author} />
        </div>
      )}
    </main>
  )
}
