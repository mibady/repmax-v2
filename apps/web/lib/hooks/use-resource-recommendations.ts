import { useState, useEffect } from 'react'
import type { SanityResource } from '@/lib/sanity/types'

export function useResourceRecommendations() {
  const [resources, setResources] = useState<SanityResource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/resources/recommendations')
      .then(r => r.ok ? r.json() : [])
      .then(data => setResources(data))
      .catch(() => setResources([]))
      .finally(() => setIsLoading(false))
  }, [])

  return { resources, isLoading }
}
