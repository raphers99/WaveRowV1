'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Home, Zap, AlertTriangle } from 'lucide-react'
import { Pill, Button, toast, SearchInput } from '@/components/ui'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import { saveListing, unsaveListing } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import type { Listing, Profile } from '@/types'

const TYPES = ['All', 'APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM']
const TYPE_LABELS: Record<string, string> = {
  All: 'All', APARTMENT: 'Apartment', HOUSE: 'House', STUDIO: 'Studio', SHARED_ROOM: 'Room',
}
const SORTS = ['Newest', 'Price: Low', 'Price: High']

// Shown when Supabase returns 0 results so the page is never empty
const MOCK_LISTINGS: Listing[] = [
  {
    id: 'mock-1', user_id: 'mock', title: 'Spacious 2BR near Tulane', type: 'APARTMENT',
    address: '6000 Freret St, New Orleans, LA', neighborhood: null, lat: 29.941, lng: -90.118,
    rent: 1200, deposit: 1200, beds: 2, baths: 1, sqft: 900,
    furnished: false, pets: true, utilities: false, photos: [],
    amenities: ['In-unit laundry', 'Parking'], proximity_tags: ['0.3 mi to Tulane'],
    description: null, status: 'ACTIVE', is_sublease: false,
    available_from: null, available_to: null, distance_to_campus: '0.3 mi',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-2', user_id: 'mock', title: 'Cozy Studio on St. Charles', type: 'STUDIO',
    address: '4800 St. Charles Ave, New Orleans, LA', neighborhood: null, lat: 29.937, lng: -90.121,
    rent: 850, deposit: 850, beds: 0, baths: 1, sqft: 450,
    furnished: true, pets: false, utilities: true, photos: [],
    amenities: ['Utilities included', 'Furnished'], proximity_tags: ['0.5 mi to Tulane'],
    description: null, status: 'ACTIVE', is_sublease: false,
    available_from: null, available_to: null, distance_to_campus: '0.5 mi',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-3', user_id: 'mock', title: 'Shared House — 1BR Available', type: 'SHARED_ROOM',
    address: '1400 Broadway St, New Orleans, LA', neighborhood: null, lat: 29.933, lng: -90.115,
    rent: 700, deposit: 700, beds: 1, baths: 2, sqft: 350,
    furnished: false, pets: true, utilities: false, photos: [],
    amenities: ['Backyard', 'Washer/Dryer'], proximity_tags: ['0.7 mi to Tulane'],
    description: null, status: 'ACTIVE', is_sublease: false,
    available_from: null, available_to: null, distance_to_campus: '0.7 mi',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
]

export function ListingsClient({
  initialListings,
  hasMore,
  loadingMore,
  onLoadMore,
  loading = false,
  error = null,
  onRetry,
}: {
  initialListings: Listing[]
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeType, setActiveType] = useState('All')
  const [activeSort, setActiveSort] = useState('Newest')
  // SearchInput owns the raw keystroke state — this component never re-renders on each keystroke.
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const filteredResultCountRef = useRef(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserId(data.session.user.id)
        supabase.from('saved_listings').select('listing_id').eq('user_id', data.session.user.id).then(({ data: saved }) => {
          if (saved) {
            setSavedIds(new Set(saved.map((r: { listing_id: string }) => r.listing_id)))
          }
        })
      }
    })
  }, [])

  // Use real listings if available; fall back to mocks only when not loading/error and DB is empty
  const sourceListings = (!loading && !error && initialListings.length === 0)
    ? MOCK_LISTINGS
    : initialListings

  const isMockData = sourceListings === MOCK_LISTINGS

  const filtered = useMemo(() => {
    let list = [...sourceListings]
    if (activeType !== 'All') list = list.filter(l => l.type === activeType)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.address.toLowerCase().includes(q) ||
        (l.title ?? '').toLowerCase().includes(q)
      )
    }
    if (activeSort === 'Price: Low') list.sort((a, b) => a.rent - b.rent)
    else if (activeSort === 'Price: High') list.sort((a, b) => b.rent - a.rent)
    return list
  }, [sourceListings, activeType, activeSort, search])

  filteredResultCountRef.current = filtered.length

  // Debounced search analytics — fires 600ms after user stops typing.
  useEffect(() => {
    if (!search) return
    const t = setTimeout(() => {
      trackEvent('search_listings', {
        query: search,
        result_count: filteredResultCountRef.current,
        screen_name: 'browse',
      })
    }, 600)
    return () => clearTimeout(t)
  }, [search])

  async function handleSave(id: string) {
    if (isMockData) return
    if (!userId) {
      router.push('/login')
      return
    }

    const isSaved = savedIds.has(id)
    const originalSavedIds = new Set(savedIds)

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev)
      if (isSaved) next.delete(id)
      else next.add(id)
      return next
    })

    try {
      if (isSaved) {
        await unsaveListing(userId, id)
        trackEvent('unsave_listing', { listing_id: id, screen_name: 'browse' })
      } else {
        await saveListing(userId, id)
        trackEvent('save_listing', { listing_id: id, screen_name: 'browse' })
      }
    } catch (error) {
      // Revert on failure
      setSavedIds(originalSavedIds)
      toast.show('Could not save listing', 'error')
    }
  }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 'calc(56px + env(safe-area-inset-top))', zIndex: 40, background: 'rgba(242,242,247,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(0,103,71,0.08)', padding: '10px 16px' }}>
        {/* Search */}
        <SearchInput
          initialValue={search}
          placeholder="Search listings..."
          inputStyle={{ width: '100%', background: 'white', border: '1px solid rgba(0,103,71,0.12)', borderRadius: 12, padding: '10px 14px', fontFamily: 'var(--font-dm-sans)', fontSize: 15, outline: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}
          onSearch={val => setSearch(val)}
          onSubmit={val => {
            // Update the URL query param for deep-linking
            const params = new URLSearchParams(Array.from(searchParams.entries()))
            if (val) params.set('q', val)
            else params.delete('q')
            router.push(`?${params.toString()}`)
          }}
        />
        {/* Type pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, marginTop: 10, scrollSnapType: 'x mandatory' }}>
          {TYPES.map(t => (
            <div key={t} style={{ flexShrink: 0, scrollSnapAlign: 'start' }}>
              <Pill label={TYPE_LABELS[t]} active={activeType === t} onClick={() => setActiveType(t)} />
            </div>
          ))}
        </div>
        {/* Sort pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {SORTS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSort(s)}
              style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontFamily: 'var(--font-dm-sans)',
                fontWeight: activeSort === s ? 600 : 400,
                background: activeSort === s ? 'rgba(0,103,71,0.1)' : 'transparent',
                color: activeSort === s ? 'var(--olive)' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 16px 0' }}>
        {/* Swipe discover banner */}
        <Link href="/swipe" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }} className="discover-banner-link">
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--olive), #004d35)', borderRadius: 14, padding: '12px 16px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={18} color="white" fill="white" />
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 14, color: 'white', margin: 0 }}>Try Discover Mode</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Swipe through listings fast</p>
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600, color: 'white', background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 10px' }}>Try it →</span>
          </div>
        </Link>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(i => <ListingSkeleton key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{ textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          >
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
            {isMockData && (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, background: 'rgba(0,103,71,0.06)', borderRadius: 8, padding: '6px 12px', display: 'inline-block' }}>
                Sample listings — be the first to post
              </p>
            )}
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {isMockData ? '' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`}
            </p>

            {filtered.length === 0 ? (
              <div
                style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              >
                <Home size={48} color="var(--text-muted)" strokeWidth={1.5} />
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No matches</h3>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>Try adjusting your filters.</p>
              </div>
            ) : (
              <div>
                <ListingGrid
                  listings={filtered}
                  onCardClick={() => {}}
                  onSave={handleSave}
                  savedIds={savedIds}
                />
                {hasMore && !search && activeType === 'All' && !isMockData && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 8px' }}>
                    <button
                      onClick={onLoadMore}
                      disabled={loadingMore}
                      style={{ background: 'white', border: '1.5px solid rgba(0,103,71,0.2)', borderRadius: 12, padding: '12px 32px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, color: 'var(--olive)', cursor: loadingMore ? 'not-allowed' : 'pointer', opacity: loadingMore ? 0.6 : 1 }}
                    >
                      {loadingMore ? 'Loading...' : 'Load more listings'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
