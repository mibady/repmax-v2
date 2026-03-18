import { defineQuery } from 'next-sanity'

// Resources
export const RESOURCES_QUERY = defineQuery(`*[_type == "resource" && defined(slug.current)] | order(featured desc, publishedAt desc) {
  _id, title, slug, audience, category, description, icon, iconColor, featured, readingTime, externalUrl, publishedAt
}`)

export const RESOURCES_BY_AUDIENCE_QUERY = defineQuery(`*[_type == "resource" && audience == $audience && defined(slug.current)] | order(featured desc, publishedAt desc) {
  _id, title, slug, audience, category, description, icon, iconColor, featured, readingTime, externalUrl, publishedAt
}`)

export const RESOURCE_BY_SLUG_QUERY = defineQuery(`*[_type == "resource" && slug.current == $slug && audience == $audience][0] {
  _id, title, slug, audience, category, description, icon, iconColor, featured, readingTime, externalUrl, body, publishedAt
}`)

// Blog Posts
export const BLOG_POSTS_QUERY = defineQuery(`*[_type == "blogPost" && defined(slug.current)] | order(isFeatured desc, publishedAt desc) {
  _id, title, slug, category, tags, excerpt, isFeatured, coverImage, publishedAt,
  author-> { name, slug, avatar, role }
}`)

export const BLOG_POSTS_BY_CATEGORY_QUERY = defineQuery(`*[_type == "blogPost" && category == $category && defined(slug.current)] | order(publishedAt desc) {
  _id, title, slug, category, tags, excerpt, isFeatured, coverImage, publishedAt,
  author-> { name, slug, avatar, role }
}`)

export const BLOG_POST_BY_SLUG_QUERY = defineQuery(`*[_type == "blogPost" && slug.current == $slug][0] {
  _id, title, slug, category, tags, excerpt, isFeatured, coverImage, body, publishedAt,
  author-> { name, slug, bio, avatar, role }
}`)

// For recommendations — resources not in excluded list
export const RESOURCES_FOR_RECS_QUERY = defineQuery(`*[_type == "resource" && defined(slug.current)] | order(featured desc, publishedAt desc) [0...20] {
  _id, title, slug, audience, category, description, icon, iconColor, featured, readingTime, externalUrl, publishedAt
}`)

// Blog categories list
export const BLOG_CATEGORIES_QUERY = defineQuery(`array::unique(*[_type == "blogPost" && defined(slug.current)].category)`)
