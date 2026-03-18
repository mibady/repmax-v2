export interface SanityResource {
  _id: string
  title: string
  slug: { current: string }
  audience: 'parent' | 'athlete'
  category: string
  description: string
  icon?: string
  iconColor?: string
  featured?: boolean
  readingTime?: number
  externalUrl?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[]
  publishedAt: string
}

export interface SanityAuthor {
  name: string
  slug: { current: string }
  bio?: string
  avatar?: { asset?: { _ref?: string } }
  role?: string
}

export interface SanityBlogPost {
  _id: string
  title: string
  slug: { current: string }
  category: string
  tags?: string[]
  author?: SanityAuthor
  coverImage?: { asset?: { _ref?: string } }
  excerpt?: string
  isFeatured?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[]
  publishedAt: string
}
