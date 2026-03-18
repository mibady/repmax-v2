import type { Metadata } from 'next'
import PublicNav from '@/components/layout/public-nav'

export const metadata: Metadata = {
  title: 'Resources | RepMax',
  description: 'NCAA recruiting resources, eligibility guides, and expert tips for athletes and parents.',
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PublicNav />
      <div className="pt-20">{children}</div>
    </div>
  )
}
