'use client'

import { useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Home, AlertTriangle, Lock } from 'lucide-react'
import { Button, toast } from '@/components/ui'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import { saveListing, unsaveListing } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import type { Listing } from '@/types'

// ─── Filter pill helper ──────────────────────────────────────────────────────

function buildUrl(
  current: URLSearchParams,
  changes: Record<string, string | null>,
): string {
  const next = new URLSearchParams(current.toString())
  for (const [key, val] of Object.entries(changes)) {
    if (val === null) next.delete(key)
    else next.set(key, val)
  }
  const str = next.toString()
  return str ? `/?${str}` : '/'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const furnished = searchParams.get('furnished') === 'true'
  const pets = searchParams.get('pets') === 'true'
  const sublet = searchParams.get('sublet') === 'true'
  const beds = searchParams.get('beds')
  const priceMax = searchParams.get('price_max')
  const sort = searchParams.get('sort') ?? 'newest'

  const pill = (
    label: string,
    active: boolean,
    changes: Record<string, string | null>,
  ) => (
    <button
      key={label}
      onClick={() => router.push(buildUrl(searchParams, changes), { scroll: false })}
      style={{
        padding: '6px 14px',
        borderRadius: 99,
        fontSize: 13,
        fontFamily: 'var(--font-dm-sans)',
        fontWeight: active ? 700 : 400,
        background: active ? 'var(--olive)' : 'white',
        color: active ? 'white' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--olive)' : 'rgba(0,103,71,0.15)'}`,
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {label}
    </button>
  )

  const BEDS = [
    { label: 'Any beds', val: null },
    { label: '1+ bed', val: '1' },
    { label: '2+ beds', val: '2' },
    { label: '3+ beds', val: '3' },
  ]
  const PRICE_MAX = [
    { label: 'Any price', val: null },
    { label: '≤$1k', val: '1000' },
    { label: '≤$1.5k', val: '1500' },
    { label: '≤$2k', val: '2000' },
  ]
  const SORTS = [
    { label: 'Newest', val: 'newest' },
    { label: 'Price ↑', val: 'price_asc' },
    { label: 'Price ↓', val: 'price_desc' },
  ]

  const anyFilterActive = furnished || pets || sublet || !!beds || !!priceMax

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Row 1: Type filters + sort */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {anyFilterActive && pill('Clear all', false, {
          furnished: null, pets: null, sublet: null, beds: null, price_max: null,
        })}
        {pill('Furnished', furnished, { furnished: furnished ? null : 'true' })}
        {pill('Pets OK', pets, { pets: pets ? null : 'true' })}
        {pill('Sublets', sublet, { sublet: sublet ? null : 'true' })}
        {SORTS.map(s => pill(
          s.label,
          sort === s.val,
          { sort: s.val === 'newest' ? null : s.val },
        ))}
      </div>
      {/* Row 2: Beds + price */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {BEDS.map(b => pill(b.label, beds === b.val, { beds: b.val }))}
        {PRICE_MAX.map(p => pill(p.label, priceMax === p.val, { price_max: p.val }))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HomeClient({
  initialListings,
  isAuthenticated,
  userId,
  hasMore,
  loadingMore,
  onLoadMore,
  loading = false,
  error = null,
  onRetry,
}: {
  initialListings: Listing[]
  isAuthenticated: boolean | null
  userId: string | null
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}) {
  const router = useRouter()
  const listingsRef = useRef<HTMLDivElement>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    createClient()
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((r: { listing_id: string }) => r.listing_id)))
      })
  }, [userId])

  function handleCreate() {
    if (isAuthenticated) router.push('/listings/new')
    else router.push('/login?next=/listings/new')
  }

  async function handleSave(id: string) {
    if (!userId) { router.push('/login'); return }
    const isSaved = savedIds.has(id)
    const prev = new Set(savedIds)
    setSavedIds(s => { const n = new Set(s); if (isSaved) n.delete(id); else n.add(id); return n })
    try {
      if (isSaved) {
        await unsaveListing(userId, id)
        trackEvent('unsave_listing', { listing_id: id, screen_name: 'home' })
      } else {
        await saveListing(userId, id)
        trackEvent('save_listing', { listing_id: id, screen_name: 'home' })
      }
    } catch {
      setSavedIds(prev)
      toast.show('Could not save listing', 'error')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px' }}>

        {/* ── Logged-out gate: show platform info instead of listings ── */}
        {isAuthenticated === false && (
          <div style={{ paddingTop: 40, paddingBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: '40px 24px', background: 'white', borderRadius: 20, border: '1px solid rgba(0,103,71,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Lock size={24} color="var(--olive)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Student access only
              </h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
                Log in with your @tulane.edu email to browse listings, contact landlords, and find roommates.
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  background: 'var(--olive)', color: 'white',
                  borderRadius: 12, padding: '12px 28px',
                  fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15,
                  textDecoration: 'none',
                }}
              >
                Log in with student email
              </Link>
            </div>

          </div>
        )}

        {/* ── Authenticated: filter bar + listings ── */}
        {isAuthenticated === true && (
          <div ref={listingsRef} style={{ paddingTop: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600, color: 'var(--olive)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                LISTINGS
              </p>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
                Available Now
              </h2>
              <FilterBar />
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {[1, 2, 3, 4, 5, 6].map(i => <ListingSkeleton key={i} />)}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div style={{ textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24} color="#ef4444" />
                </div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Could not load listings
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{error}</p>
                {onRetry && <Button label="Try Again" onClick={onRetry} variant="primary" />}
              </div>
            )}

            {/* Listings grid */}
            {!loading && !error && (
              <>
                {initialListings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <Home size={48} color="var(--text-muted)" strokeWidth={1.5} />
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      No listings found
                    </h3>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
                      Try adjusting your filters.
                    </p>
                  </div>
                ) : (
                  <>
                    <ListingGrid
                      listings={initialListings}
                      onCardClick={() => {}}
                      onSave={handleSave}
                      savedIds={savedIds}
                    />
                    {hasMore && (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 8px' }}>
                        <button
                          onClick={onLoadMore}
                          disabled={loadingMore}
                          style={{
                            background: 'white', border: '1.5px solid rgba(0,103,71,0.2)',
                            borderRadius: 12, padding: '12px 32px',
                            fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14,
                            color: 'var(--olive)', cursor: loadingMore ? 'not-allowed' : 'pointer',
                            opacity: loadingMore ? 0.6 : 1,
                          }}
                        >
                          {loadingMore ? 'Loading...' : 'Load more listings'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* CTA Banner */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              style={{ background: 'linear-gradient(135deg, var(--olive) 0%, var(--olive-dark) 100%)', borderRadius: 20, padding: '40px 24px', textAlign: 'center', margin: '40px 0 24px' }}
            >
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>List Your Place</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>Reach students looking for housing. Free to list.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 12, padding: '12px 28px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
              >
                Create a Listing
              </motion.button>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}
