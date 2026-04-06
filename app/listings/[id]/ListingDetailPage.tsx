'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ListingDetail } from './ListingDetail'
import type { Listing } from '@/types'

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const { data, error } = await createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
          .from('listings').select('*').eq('id', id).single()
        if (error || !data) router.replace('/listings')
        else setListing(data as Listing)
      } catch {
        router.replace('/listings')
      }
      setLoading(false)
    })()
  }, [id, router])

  if (loading) return <div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />

  return listing ? <ListingDetail listing={listing} /> : null
}
