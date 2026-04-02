'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SwipeStack } from '@/components/swipe'
import { ListingSkeleton } from '@/components/listing'
import { fetchListings, swipeAction } from '@/lib/api'
import { createBrowserClient } from '@supabase/ssr'
import type { Listing, SwipeAction as SwipeActionType } from '@/types'

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export default function SwipePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
    })
    fetchListings()
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleSwipe(id: string, action: SwipeActionType) {
    if (userId) await swipeAction(userId, id, action).catch(() => {})
  }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--surface)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 8px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Discover</h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Swipe right to save, left to skip</p>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <ListingSkeleton />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 80, overflow: 'hidden' }}>
          <SwipeStack listings={listings} onSwipe={handleSwipe} />
        </div>
      )}
    </div>
  )
}
