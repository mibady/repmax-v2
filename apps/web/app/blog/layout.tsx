import type { Metadata } from 'next'
import PublicNav from '@/components/layout/public-nav'

export const metadata: Metadata = {
  title: 'Blog | RepMax',
  description: 'Recruiting tips, training advice, NCAA news, and success stories from the RepMax team.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PublicNav />
      <div className="pt-20">{children}</div>
    </div>
  )
}
