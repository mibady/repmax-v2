/**
 * One-time migration script: WordPress → Sanity
 *
 * Usage:
 *   npx tsx scripts/import-wordpress.ts
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (or env)
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load env from apps/web/.env.local
dotenv.config({ path: resolve(__dirname, '../apps/web/.env.local') })

const sanity = createClient({
  projectId: '55y1892a',
  dataset: 'production',
  apiVersion: '2024-07-11',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// ── WordPress API ──────────────────────────────────────────────────

interface WPPost {
  id: number
  date: string
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    author?: Array<{ name: string; slug: string }>
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text?: string }>
  }
}

async function fetchWordPressPosts(): Promise<WPPost[]> {
  const allPosts: WPPost[] = []
  let page = 1

  while (true) {
    const url = `https://repmax.io/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed`
    console.log(`Fetching page ${page} from WordPress API...`)
    const res = await fetch(url)

    // WP REST API returns 400 when page is beyond total pages
    if (res.status === 400) break
    if (!res.ok) throw new Error(`WordPress API error: ${res.status} ${res.statusText}`)

    const posts: WPPost[] = await res.json()
    if (posts.length === 0) break

    allPosts.push(...posts)
    console.log(`  Page ${page}: ${posts.length} posts (${allPosts.length} total)`)

    // Check if there are more pages
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10)
    if (page >= totalPages) break
    page++
  }

  console.log(`Fetched ${allPosts.length} posts total`)
  return allPosts
}

// ── HTML → Portable Text conversion ────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Convert HTML content to Portable Text blocks.
 * This is a lightweight converter that handles the most common WordPress patterns:
 * paragraphs, headings (h2-h4), lists, blockquotes, links, bold, italic.
 */
function htmlToPortableText(html: string): any[] {
  const blocks: any[] = []

  // Split on block-level elements
  // First, normalize the HTML
  const normalized = html
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  // Extract block-level elements
  const blockRegex = /<(p|h[1-6]|blockquote|ul|ol|li|figure|figcaption|div)[^>]*>([\s\S]*?)<\/\1>/gi
  const rawBlocks: Array<{ tag: string; content: string }> = []

  let match
  let lastIndex = 0

  // Simple approach: split by closing block tags and process each chunk
  const chunks = normalized.split(/(?=<(?:p|h[1-6]|blockquote|ul|ol|figure)[\s>])/i)

  for (const chunk of chunks) {
    const trimmed = chunk.trim()
    if (!trimmed) continue

    // Detect tag type
    const tagMatch = trimmed.match(/^<(p|h[1-6]|blockquote|ul|ol|figure)[\s>]/i)
    const tag = tagMatch ? tagMatch[1].toLowerCase() : 'p'

    // Extract inner content (remove outer tag)
    const innerMatch = trimmed.match(/^<[^>]*>([\s\S]*)<\/[^>]*>\s*$/i)
    const inner = innerMatch ? innerMatch[1] : trimmed

    if (tag === 'ul' || tag === 'ol') {
      // Extract list items
      const listType = tag === 'ol' ? 'number' : 'bullet'
      const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let itemMatch
      while ((itemMatch = itemRegex.exec(inner)) !== null) {
        const itemContent = itemMatch[1].trim()
        if (itemContent) {
          blocks.push(makeBlock(itemContent, 'normal', listType))
        }
      }
    } else if (tag === 'blockquote') {
      const cleaned = stripBlockTags(inner)
      if (cleaned) {
        blocks.push(makeBlock(cleaned, 'blockquote'))
      }
    } else if (tag.match(/^h[2-4]$/)) {
      const cleaned = stripBlockTags(inner)
      if (cleaned) {
        blocks.push(makeBlock(cleaned, tag as 'h2' | 'h3' | 'h4'))
      }
    } else if (tag === 'figure') {
      // Skip figures (images) — we don't import media
      continue
    } else {
      // Paragraph or other
      const cleaned = stripBlockTags(inner)
      if (cleaned) {
        blocks.push(makeBlock(cleaned, 'normal'))
      }
    }
  }

  // If no blocks were extracted, create a single block from stripped HTML
  if (blocks.length === 0) {
    const text = stripHtml(html)
    if (text) {
      blocks.push(makeBlock(text, 'normal'))
    }
  }

  return blocks
}

function stripBlockTags(html: string): string {
  return html
    .replace(/<\/?(?:p|div|span|figure|figcaption)[^>]*>/gi, '')
    .trim()
}

function makeBlock(
  html: string,
  style: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote' = 'normal',
  listItem?: 'bullet' | 'number'
): any {
  const { children, markDefs } = parseInlineHtml(html)

  const block: any = {
    _type: 'block',
    _key: randomKey(),
    style,
    children,
    markDefs,
  }

  if (listItem) {
    block.listItem = listItem
    block.level = 1
  }

  return block
}

function parseInlineHtml(html: string): { children: any[]; markDefs: any[] } {
  const children: any[] = []
  const markDefs: any[] = []

  // Simple inline parser — handles <strong>, <em>, <a>, <b>, <i>
  let remaining = html
  let currentMarks: string[] = []
  const markStack: Array<{ tag: string; markKey?: string }> = []

  // Regex to find next inline tag
  const tagRegex = /<(\/?)(\w+)([^>]*)>/g
  let lastIndex = 0
  let tagMatch

  while ((tagMatch = tagRegex.exec(remaining)) !== null) {
    const [fullMatch, isClosing, tagName, attrs] = tagMatch
    const tag = tagName.toLowerCase()

    // Text before this tag
    if (tagMatch.index > lastIndex) {
      const text = decodeHtmlEntities(remaining.slice(lastIndex, tagMatch.index))
      if (text) {
        children.push({
          _type: 'span',
          _key: randomKey(),
          text,
          marks: [...currentMarks],
        })
      }
    }

    if (isClosing) {
      // Closing tag — pop from stack
      const idx = markStack.findLastIndex((m) => m.tag === tag)
      if (idx !== -1) {
        const removed = markStack.splice(idx, 1)[0]
        currentMarks = currentMarks.filter(
          (m) => m !== (removed.markKey || tagToMark(tag))
        )
      }
    } else {
      // Opening tag
      if (tag === 'a') {
        const hrefMatch = attrs.match(/href="([^"]*)"/)
        if (hrefMatch) {
          const key = randomKey()
          markDefs.push({
            _type: 'link',
            _key: key,
            href: decodeHtmlEntities(hrefMatch[1]),
            blank: true,
          })
          currentMarks.push(key)
          markStack.push({ tag, markKey: key })
        }
      } else if (['strong', 'b', 'em', 'i', 'code'].includes(tag)) {
        const mark = tagToMark(tag)
        currentMarks.push(mark)
        markStack.push({ tag })
      }
      // Skip other tags (br, img, etc.)
    }

    lastIndex = tagMatch.index + fullMatch.length
  }

  // Remaining text
  if (lastIndex < remaining.length) {
    const text = decodeHtmlEntities(remaining.slice(lastIndex))
    if (text.trim()) {
      children.push({
        _type: 'span',
        _key: randomKey(),
        text,
        marks: [...currentMarks],
      })
    }
  }

  // Ensure at least one child
  if (children.length === 0) {
    children.push({
      _type: 'span',
      _key: randomKey(),
      text: decodeHtmlEntities(stripHtml(html)),
      marks: [],
    })
  }

  return { children, markDefs }
}

function tagToMark(tag: string): string {
  switch (tag) {
    case 'strong':
    case 'b':
      return 'strong'
    case 'em':
    case 'i':
      return 'em'
    case 'code':
      return 'code'
    default:
      return tag
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
}

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ── Image upload ──────────────────────────────────────────────────

async function uploadImageFromUrl(
  imageUrl: string,
  filename?: string
): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } } | null> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await res.arrayBuffer())

    const asset = await sanity.assets.upload('image', buffer, {
      filename: filename || imageUrl.split('/').pop()?.split('?')[0] || 'cover.jpg',
      contentType,
    })

    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    }
  } catch (err) {
    console.warn(`    ⚠ Failed to upload image: ${imageUrl}`)
    return null
  }
}

// ── Category mapping ───────────────────────────────────────────────

function mapCategory(post: WPPost): string {
  const title = post.title.rendered.toLowerCase()
  const content = post.content.rendered.toLowerCase()

  if (title.includes('transfer portal') || title.includes('ncaa')) return 'ncaa-news'
  if (title.includes('recruiting') || title.includes('recruit')) return 'recruiting-tips'
  if (title.includes('training') || title.includes('workout')) return 'training'
  if (title.includes('parent') || title.includes('family')) return 'recruiting-tips'
  if (title.includes('playoff') || title.includes('stage')) return 'recruiting-tips'
  if (content.includes('ncaa') || content.includes('eligibility')) return 'ncaa-news'
  return 'recruiting-tips'
}

// ── Main import ────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('Missing SANITY_API_WRITE_TOKEN. Set it in apps/web/.env.local')
    process.exit(1)
  }

  const posts = await fetchWordPressPosts()

  // Collect unique authors
  const authorMap = new Map<string, string>() // slug → sanity _id

  for (const post of posts) {
    const wpAuthor = post._embedded?.author?.[0]
    const authorName = wpAuthor?.name || 'RepMax'
    const authorSlug = wpAuthor?.slug || 'repmax'

    if (!authorMap.has(authorSlug)) {
      // Check if author already exists in Sanity
      const existing = await sanity.fetch(
        `*[_type == "author" && slug.current == $slug][0]._id`,
        { slug: authorSlug }
      )

      if (existing) {
        console.log(`  Author "${authorName}" already exists (${existing})`)
        authorMap.set(authorSlug, existing)
      } else {
        const author = await sanity.create({
          _type: 'author',
          name: authorName,
          slug: { _type: 'slug', current: authorSlug },
          role: authorName === 'RepMax' ? 'Platform' : 'Contributor',
        })
        console.log(`  Created author "${authorName}" (${author._id})`)
        authorMap.set(authorSlug, author._id)
      }
    }
  }

  // Import posts (newest first so first post gets isFeatured)
  const sorted = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  for (let i = 0; i < sorted.length; i++) {
    const post = sorted[i]
    const title = decodeHtmlEntities(stripHtml(post.title.rendered))
    const slug = post.slug

    // Upload featured image if available
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]
    let coverImage: { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | null = null
    if (featuredMedia?.source_url) {
      console.log(`    Uploading cover image...`)
      coverImage = await uploadImageFromUrl(featuredMedia.source_url, `${slug}-cover`)
    }

    // Check if already imported
    const existing = await sanity.fetch(
      `*[_type == "blogPost" && slug.current == $slug][0]{_id, "hasCover": defined(coverImage)}`,
      { slug }
    )
    if (existing) {
      // Patch cover image onto existing posts that are missing one
      if (coverImage && !existing.hasCover) {
        await sanity.patch(existing._id).set({ coverImage }).commit()
        console.log(`  Patched cover image on "${title}"`)
      } else {
        console.log(`  Skipping "${title}" (already exists${existing.hasCover ? ', has cover' : ''})`)
      }
      continue
    }

    const wpAuthor = post._embedded?.author?.[0]
    const authorSlug = wpAuthor?.slug || 'repmax'
    const authorId = authorMap.get(authorSlug)

    const body = htmlToPortableText(post.content.rendered)
    const excerpt = stripHtml(post.excerpt.rendered).slice(0, 250)

    const doc: Record<string, unknown> = {
      _type: 'blogPost',
      title,
      slug: { _type: 'slug', current: slug },
      category: mapCategory(post),
      excerpt: excerpt || undefined,
      isFeatured: i === 0, // newest post is featured
      body,
      publishedAt: post.date,
      author: authorId ? { _type: 'reference', _ref: authorId } : undefined,
    }

    if (coverImage) {
      doc.coverImage = coverImage
    }

    const created = await sanity.create(doc)
    console.log(`  Imported "${title}" → ${created._id}`)
  }

  console.log('\nDone! Posts should now appear on /blog')
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
