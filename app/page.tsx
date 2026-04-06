'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HomeClient } from './HomeClient'
import type { Listing } from '@/types'

export default function HomePage() {
  const [featured, setFeatured] = useState<Listing[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await createClient()
          .from('listings').select('id, user_id, title, type, address, rent, beds, baths, furnished, pets, utilities, photos, is_sublease')
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false })
          .limit(6)
        setFeatured((data ?? []) as Listing[])
      } catch (error) {
        console.error('Failed to fetch featured listings:', error)
      }
    })()
  }, [])

  return <HomeClient featured={featured} />
}
