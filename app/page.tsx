'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { HomeClient } from './HomeClient'
import type { Listing } from '@/types'

export default function HomePage() {
  const [featured, setFeatured] = useState<Listing[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
          .from('listings').select('*').eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(6)
        setFeatured((data ?? []) as Listing[])
      } catch {}
    })()
  }, [])

  return <HomeClient featured={featured} />
}
