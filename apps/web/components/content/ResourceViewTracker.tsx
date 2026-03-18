'use client'

import { useEffect } from 'react'

interface ResourceViewTrackerProps {
  resourceId: string
  resourceType: 'resource' | 'blog_post'
  category?: string
  audience?: string
}

export function ResourceViewTracker({ resourceId, resourceType, category, audience }: ResourceViewTrackerProps) {
  useEffect(() => {
    // Fire-and-forget view tracking (same pattern as profile_views)
    fetch('/api/resources/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId, resourceType, category, audience }),
    }).catch(() => {})
  }, [resourceId, resourceType, category, audience])

  return null
}
