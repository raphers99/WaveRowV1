'use client'

import { useState, useEffect } from 'react'
import { SwipeStack } from '@/components/swipe'
import { ListingSkeleton } from '@/components/listing'
import { fetchListings, swipeAction } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import type { Listing, SwipeAction as SwipeActionType } from '@/types'

function loginUrl() {
  return `/login/?next=${encodeURIComponent('/swipe/')}`
}

function redirectToLogin() {
  if (typeof window !== 'undefined') window.location.assign(loginUrl())
}

export default function SwipePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    createClient()
      .auth.getSession()
      .then(({ data, error }) => {
        if (cancelled) return
        // #region agent log
        fetch('http://127.0.0.1:7941/ingest/afec164a-073a-4f26-99a4-54c2aecb885c', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '952fbb' },
          body: JSON.stringify({
            sessionId: '952fbb',
            location: 'app/swipe/page.tsx:getSession',
            message: 'swipe auth gate',
            data: { hasSession: !!data.session, hasError: !!error },
            timestamp: Date.now(),
            hypothesisId: 'H1',
            runId: 'singleton-hardnav',
          }),
        }).catch(() => {})
        // #endregion
        if (error || !data.session) {
          setLoading(false)
          redirectToLogin()
          return
        }
        setUserId(data.session.user.id)
        fetchListings()
          .then(setListings)
          .catch(() => setListings([]))
          .finally(() => setLoading(false))
      })
      .catch(() => {
        if (cancelled) return
        // #region agent log
        fetch('http://127.0.0.1:7941/ingest/afec164a-073a-4f26-99a4-54c2aecb885c', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '952fbb' },
          body: JSON.stringify({
            sessionId: '952fbb',
            location: 'app/swipe/page.tsx:getSession',
            message: 'getSession rejected',
            data: {},
            timestamp: Date.now(),
            hypothesisId: 'H3',
            runId: 'singleton-hardnav',
          }),
        }).catch(() => {})
        // #endregion
        setLoading(false)
        redirectToLogin()
      })
    return () => {
      cancelled = true
    }
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
