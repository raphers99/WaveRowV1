'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ListingDetail } from './ListingDetail'
import type { Listing } from '@/types'

type ListerProfile = {
  name: string
  role: string
  avatar: string | null
}

function getSupabase() {
  return createClient()
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [profile, setProfile] = useState<ListerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // In static export mode with Vercel rewrites, Next.js hydration provides 
    // the static build ID ('placeholder') instead of the actual dynamic URL UUID.
    // Read the true ID directly from the browser window location.
    let realId = id
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean)
      if (parts.length > 0) {
        realId = parts[parts.length - 1]
      }
    }

    if (!realId || realId === 'placeholder') return

    ;(async () => {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', realId)
          .single()

        if (error || !data) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setListing(data as Listing)

        // Fetch poster's profile (non-fatal if missing)
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, role, avatar')
            .eq('user_id', (data as Listing).user_id)
            .single()
          if (profileData) setProfile(profileData as ListerProfile)
        } catch {
          // no-op — profile is optional
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 120, minHeight: '100dvh', background: 'var(--surface)' }}>
        {/* Photo skeleton */}
        <div style={{ aspectRatio: '16/9', background: 'rgba(0,103,71,0.08)' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ height: 28, width: 120, borderRadius: 10, background: 'rgba(0,103,71,0.1)', marginBottom: 16 }} />
          <div style={{ height: 18, width: '60%', borderRadius: 8, background: 'rgba(0,103,71,0.08)', marginBottom: 12 }} />
          <div style={{ height: 14, width: '40%', borderRadius: 8, background: 'rgba(0,103,71,0.06)', marginBottom: 24 }} />
          <div style={{ height: 80, borderRadius: 14, background: 'rgba(0,103,71,0.06)' }} />
        </div>
      </div>
    )
  }

  if (notFound || !listing) {
    return (
      <div style={{
        paddingTop: 'calc(56px + env(safe-area-inset-top))',
        minHeight: '100dvh',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Listing not found
          </h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
            This listing could not be found. It may have been removed or the link is incorrect.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: 'var(--olive)', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '12px 28px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15 }}>
            Browse All Listings
          </Link>
        </div>
      </div>
    )
  }

  return <ListingDetail listing={listing} profile={profile} />
}
