# Sanity - Headless CMS

**Official Website:** https://www.sanity.io
**Documentation:** https://www.sanity.io/docs
**Pricing:** Free tier: 3 users, 2 datasets, 10k docs

---

## Overview

Sanity is a headless CMS with a real-time collaborative editing environment. It provides structured content, powerful querying with GROQ, asset management, and customizable editing interface (Sanity Studio). Perfect for content-rich applications, marketing sites, and e-commerce.

### Key Features

- ✅ Structured content modeling
- ✅ Real-time collaborative editing
- ✅ GROQ query language
- ✅ Rich text editing (Portable Text)
- ✅ Asset management (images, videos, files)
- ✅ Customizable Studio
- ✅ Content versioning
- ✅ GraphQL API
- ✅ Webhooks
- ✅ CDN delivery
- ✅ TypeScript support
- ✅ Next.js optimized

---

## Use Cases for AI Coder

1. **Content Management**
   - Blog posts & articles
   - Marketing pages
   - Product catalogs
   - Documentation

2. **Media Management**
   - Image library
   - Video content
   - File downloads
   - Asset organization

3. **E-commerce**
   - Product listings
   - Category management
   - Inventory tracking
   - Order management

4. **Multi-channel Content**
   - Website content
   - Mobile app content
   - Email templates
   - Social media

---

## Quick Start

### 1. Installation

```bash
npm install sanity @sanity/client next-sanity
# or
pnpm add sanity @sanity/client next-sanity
```

### 2. Create Sanity Project

```bash
# Create new Sanity project
npm create sanity@latest

# Follow prompts to:
# - Choose project name
# - Select dataset name (production)
# - Choose schema template
```

### 3. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=xxx # Create in Sanity dashboard
```

### 4. Configure Sanity Client

```typescript
// lib/sanity/client.ts
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: true, // Use CDN for faster reads
  token: process.env.SANITY_API_TOKEN, // For authenticated requests
});
```

```typescript
// lib/sanity/config.ts
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schema';

export default defineConfig({
  name: 'default',
  title: 'My Project',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
```

---

## Schema Definition

### Define Content Types

```typescript
// sanity/schema/post.ts
import { defineType, defineField } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection;
      return {
        ...selection,
        subtitle: author && `by ${author}`,
      };
    },
  },
});
```

### Rich Text (Portable Text)

```typescript
// sanity/schema/blockContent.ts
import { defineType } from 'sanity';

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'URL',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
    },
    {
      type: 'code',
      options: {
        withFilename: true,
      },
    },
  ],
});
```

---

## Querying Content (GROQ)

### Fetch All Posts

```typescript
// app/blog/page.tsx
import { client } from '@/lib/sanity/client';

async function getPosts() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      "author": author->name,
      mainImage,
      "categories": categories[]->title
    }
  `);
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map((post) => (
        <article key={post._id}>
          <h2>{post.title}</h2>
          <p>By {post.author}</p>
          <time>{post.publishedAt}</time>
        </article>
      ))}
    </div>
  );
}
```

### Fetch Single Post

```typescript
// app/blog/[slug]/page.tsx
import { client } from '@/lib/sanity/client';

async function getPost(slug: string) {
  return client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      publishedAt,
      "author": author->{name, image},
      mainImage,
      body,
      "categories": categories[]->title
    }
  `,
    { slug }
  );
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author.name}</p>
      {/* Render Portable Text */}
      <PortableText value={post.body} />
    </article>
  );
}
```

### Complex Queries

```typescript
// Advanced GROQ queries
import { client } from '@/lib/sanity/client';

// Search posts
export async function searchPosts(query: string) {
  return client.fetch(
    `
    *[_type == "post" && [title, body] match $query] {
      _id,
      title,
      slug
    }
  `,
    { query: `*${query}*` }
  );
}

// Get related posts
export async function getRelatedPosts(postId: string, categories: string[]) {
  return client.fetch(
    `
    *[_type == "post"
      && _id != $postId
      && count((categories[]->_id)[@ in $categories]) > 0
    ] | order(publishedAt desc) [0...5] {
      _id,
      title,
      slug,
      mainImage
    }
  `,
    { postId, categories }
  );
}

// Paginated query
export async function getPaginatedPosts(page: number, perPage: number) {
  const start = page * perPage;
  const end = start + perPage;

  return client.fetch(
    `
    {
      "posts": *[_type == "post"] | order(publishedAt desc) [$start...$end] {
        _id,
        title,
        slug,
        publishedAt
      },
      "total": count(*[_type == "post"])
    }
  `,
    { start, end }
  );
}
```

---

## Image Optimization

### Use Sanity Image URLs

```typescript
// lib/sanity/image.ts
import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
```

```typescript
// components/sanity-image.tsx
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/image';

export function SanityImage({ image, alt }: { image: any; alt: string }) {
  if (!image) return null;

  return (
    <Image
      src={urlFor(image).width(800).url()}
      alt={alt}
      width={800}
      height={600}
      className="rounded-lg"
    />
  );
}
```

### Responsive Images

```typescript
// Generate srcset for responsive images
export function getImageSrcSet(image: any) {
  return {
    src: urlFor(image).width(800).url(),
    srcSet: `
      ${urlFor(image).width(400).url()} 400w,
      ${urlFor(image).width(800).url()} 800w,
      ${urlFor(image).width(1200).url()} 1200w,
      ${urlFor(image).width(1600).url()} 1600w
    `,
    sizes: '(max-width: 800px) 100vw, 800px',
  };
}
```

---

## Portable Text Rendering

### Setup Portable Text

```bash
npm install @portabletext/react
```

```typescript
// components/portable-text.tsx
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity/image';
import Image from 'next/image';

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <Image
        src={urlFor(value).width(800).url()}
        alt={value.alt || 'Image'}
        width={800}
        height={600}
      />
    ),
    code: ({ value }) => (
      <pre className="bg-gray-100 p-4 rounded">
        <code>{value.code}</code>
      </pre>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value.href} className="text-blue-600 hover:underline">
        {children}
      </a>
    ),
  },
  block: {
    h1: ({ children }) => <h1 className="text-4xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold mb-2">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic">
        {children}
      </blockquote>
    ),
  },
};

export function PortableTextContent({ value }: { value: any }) {
  return <PortableText value={value} components={components} />;
}
```

---

## Real-time Updates

### Listen to Changes

```typescript
// components/realtime-posts.tsx
'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/sanity/client';

export function RealtimePosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Initial fetch
    client
      .fetch('*[_type == "post"] | order(publishedAt desc)')
      .then(setPosts);

    // Listen for changes
    const subscription = client
      .listen('*[_type == "post"]')
      .subscribe((update) => {
        if (update.result) {
          setPosts((current) => {
            const index = current.findIndex((p) => p._id === update.result._id);
            if (index >= 0) {
              // Update existing
              const updated = [...current];
              updated[index] = update.result;
              return updated;
            } else {
              // Add new
              return [update.result, ...current];
            }
          });
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
}
```

---

## Integration with AI Coder Services

### With Next.js ISR

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await client.fetch(`*[_type == "post"]{ slug }`);

  return posts.map((post: any) => ({
    slug: post.slug.current,
  }));
}

export const revalidate = 60; // Revalidate every 60 seconds
```

### With Webhooks (Inngest)

```typescript
// app/api/webhooks/sanity/route.ts
import { inngest } from '@/lib/inngest';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Trigger Inngest function
  await inngest.send({
    name: 'sanity/content.updated',
    data: {
      documentId: body._id,
      type: body._type,
    },
  });

  return NextResponse.json({ received: true });
}
```

```typescript
// inngest/functions/revalidate-content.ts
import { inngest } from '@/lib/inngest';
import { revalidatePath } from 'next/cache';

export const revalidateContent = inngest.createFunction(
  { id: 'revalidate-content' },
  { event: 'sanity/content.updated' },
  async ({ event }) => {
    if (event.data.type === 'post') {
      revalidatePath('/blog');
      revalidatePath(`/blog/${event.data.slug}`);
    }
  }
);
```

### With AI (Content Generation)

```typescript
// app/actions/generate-content.ts
'use server';

import { client } from '@/lib/sanity/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateBlogPost(topic: string) {
  // Generate content with AI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a professional content writer.',
      },
      {
        role: 'user',
        content: `Write a blog post about: ${topic}`,
      },
    ],
  });

  const content = response.choices[0].message.content;

  // Create draft in Sanity
  const post = await client.create({
    _type: 'post',
    title: topic,
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: content,
          },
        ],
      },
    ],
    publishedAt: new Date().toISOString(),
  });

  return post;
}
```

---

## Sanity Studio Customization

### Custom Input Component

```typescript
// sanity/components/ColorPicker.tsx
import { StringInputProps } from 'sanity';

export function ColorPicker(props: StringInputProps) {
  return (
    <div>
      <input
        type="color"
        value={props.value || '#000000'}
        onChange={(e) => props.onChange(e.target.value)}
      />
      <input
        type="text"
        value={props.value || ''}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}
```

### Use Custom Component

```typescript
// sanity/schema/settings.ts
import { ColorPicker } from '../components/ColorPicker';

export const settings = {
  name: 'settings',
  type: 'document',
  fields: [
    {
      name: 'primaryColor',
      type: 'string',
      components: {
        input: ColorPicker,
      },
    },
  ],
};
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Optional
SANITY_API_TOKEN=xxx # For write operations
SANITY_WEBHOOK_SECRET=xxx # For webhooks
```

### 2. Type Safety

```bash
# Generate TypeScript types from schema
npm install --save-dev sanity-codegen
npx sanity-codegen
```

```typescript
// Use generated types
import type { Post } from '@/sanity/types';

const posts: Post[] = await client.fetch('*[_type == "post"]');
```

### 3. Caching Strategy

```typescript
// Use CDN for public reads
const clientPublic = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: true, // Use CDN
});

// Use API directly for authenticated/real-time
const clientAuth = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: false, // Direct API
  token: process.env.SANITY_API_TOKEN!,
});
```

### 4. Error Handling

```typescript
try {
  const posts = await client.fetch('*[_type == "post"]');
  return posts;
} catch (error) {
  console.error('Sanity fetch error:', error);
  return [];
}
```

### 5. Preview Mode

```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  draftMode().enable();
  redirect(slug || '/');
}
```

---

## Pricing

**Free Tier:**
- 3 users
- 2 datasets
- 10,000 documents
- 5GB assets
- Community support

**Growth ($99/month):**
- Unlimited users
- Unlimited datasets
- Unlimited documents
- 200GB assets
- Email support

**Enterprise:**
- Custom pricing
- Dedicated support
- SLA guarantees
- Advanced features

---

## Resources

- **Documentation:** https://www.sanity.io/docs
- **Studio:** https://your-project.sanity.studio
- **Schema Reference:** https://www.sanity.io/docs/schema-types
- **GROQ Cheat Sheet:** https://www.sanity.io/docs/query-cheat-sheet
- **Slack Community:** https://slack.sanity.io

---

## Next Steps

1. Create Sanity project
2. Define content schemas
3. Configure Sanity client
4. Build Studio interface
5. Implement GROQ queries
6. Set up image optimization
7. Configure webhooks
8. Deploy Sanity Studio

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
