'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { SubletClient } from './SubletClient'
import type { Listing } from '@/types'

export default function SubletsPage() {
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
          .from('listings').select('*').eq('is_sublease', true).eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(100)
        setListings((data ?? []) as Listing[])
      } catch (error) {
        console.error('Failed to fetch sublets:', error)
      }
    })()
  }, [])

  return <SubletClient initialListings={listings} />
}
