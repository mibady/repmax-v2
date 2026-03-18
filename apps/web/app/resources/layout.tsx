import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources | RepMax',
  description: 'NCAA recruiting resources, eligibility guides, and expert tips for athletes and parents.',
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4L6 12V24C6 35.05 13.84 45.24 24 48C34.16 45.24 42 35.05 42 24V12L24 4ZM24 42C16.82 39.67 11 32.18 11 24V14.5L24 8.72L37 14.5V24C37 32.18 31.18 39.67 24 42Z" fill="currentColor" />
                <path d="M24 14L18 20L20.12 22.12L22.5 19.75V28H25.5V19.75L27.88 22.12L30 20L24 14Z" fill="white" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">RepMax</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/resources" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="/blog" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/login" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
