'use client'

import { useEffect, useState } from 'react'
import type { Config } from 'sanity'

export default function StudioPage() {
  const [Studio, setStudio] = useState<React.ComponentType<{ config: Config }> | null>(null)
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    Promise.all([
      import('next-sanity/studio').then((mod) => mod.NextStudio),
      import('../../../sanity.config').then((mod) => mod.default),
    ]).then(([StudioComponent, sanityConfig]) => {
      setStudio(() => StudioComponent)
      setConfig(sanityConfig)
    })
  }, [])

  if (!Studio || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101112]">
        <p className="text-white/50 text-sm">Loading Studio...</p>
      </div>
    )
  }

  return <Studio config={config} />
}
