'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui'
import { SubletClient } from './SubletClient'
import type { Listing } from '@/types'

export default function SubletsPage() {
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await createClient()
          .from('listings').select('id, user_id, title, type, address, rent, beds, baths, furnished, pets, utilities, photos, is_sublease, neighborhood, lat, lng, deposit, sqft, amenities, proximity_tags, description, status, available_from, available_to, distance_to_campus, created_at, updated_at').eq('is_sublease', true).eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(100)
        setListings((data ?? []) as Listing[])
      } catch {
        toast.show('Could not load sublets', 'error')
      }
    })()
  }, [])

  return <SubletClient initialListings={listings} />
}
