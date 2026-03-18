'use client'

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-white mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-white mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-medium text-white mt-4 mb-2">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-6 text-slate-300 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="font-mono text-sm bg-[#1a1a1a] text-primary px-1.5 py-0.5 rounded">{children}</code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt || ''}
            width={800}
            height={450}
            className="rounded-lg w-full"
          />
          {value.caption && (
            <figcaption className="text-sm text-slate-500 mt-2 text-center">{value.caption}</figcaption>
          )}
        </figure>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-300">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2 text-slate-300">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
}

interface PortableTextRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[]
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return (
    <div className="prose-dark">
      <PortableText value={value} components={components} />
    </div>
  )
}
