'use client'

import { useState, useEffect } from 'react'

interface ResourceSaveButtonProps {
  resourceId: string
  resourceType: 'resource' | 'blog_post'
  audience?: string
}

export function ResourceSaveButton({ resourceId, resourceType, audience }: ResourceSaveButtonProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already saved
    fetch(`/api/resources/save?resourceId=${resourceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.saved) setSaved(true)
      })
      .catch(() => {})
  }, [resourceId])

  const toggleSave = async () => {
    setLoading(true)
    try {
      const method = saved ? 'DELETE' : 'POST'
      const res = await fetch('/api/resources/save', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, resourceType, audience }),
      })
      if (res.ok) setSaved(!saved)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        saved
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {saved ? 'bookmark' : 'bookmark_border'}
      </span>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
