'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Shield, MessageCircle, Lock, Calendar, Users, Home, AlertTriangle, Search } from 'lucide-react'
import { Section, SectionItem, Button, toast } from '@/components/ui'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'
import { saveListing, unsaveListing } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import type { Listing } from '@/types'

// Fallback mock data shown when Supabase returns 0 results
const MOCK_LISTINGS: Listing[] = [
  {
    id: 'mock-1', user_id: 'mock', title: 'Spacious 2BR Near Campus', type: 'APARTMENT',
    address: '1412 Audubon St, New Orleans, LA', neighborhood: null, lat: 29.941, lng: -90.118,
    rent: 1_650, deposit: 1_650, beds: 2, baths: 1, sqft: 900,
    furnished: true, pets: false, utilities: false, photos: [],
    amenities: ['In-unit laundry', 'Parking'], proximity_tags: ['0.3 mi to Tulane'],
    description: null, status: 'ACTIVE', is_sublease: false,
    available_from: null, available_to: null, distance_to_campus: '0.3 mi',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-2', user_id: 'mock', title: 'Cozy Studio on Freret', type: 'STUDIO',
    address: '4820 Freret St, New Orleans, LA', neighborhood: null, lat: 29.937, lng: -90.121,
    rent: 1_100, deposit: 1_100, beds: 0, baths: 1, sqft: 450,
    furnished: false, pets: true, utilities: true, photos: [],
    amenities: ['Utilities included'], proximity_tags: ['0.5 mi to Tulane'],
    description: null, status: 'ACTIVE', is_sublease: false,
    available_from: null, available_to: null, distance_to_campus: '0.5 mi',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-3', user_id: 'mock', title: 'Spring Sublet — 3BR House', type: 'HOUSE',
    address: '7204 Maple St, New Orleans, LA', neighborhood: null, lat: 29.933, lng: -90.115,
    rent: 2_400, deposit: 2_400, beds: 3, baths: 2, sqft: 1_400,
    furnished: true, pets: false, utilities: false, photos: [],
    amenities: ['Backyard', 'Parking'], proximity_tags: ['0.7 mi to Tulane'],
    description: null, status: 'ACTIVE', is_sublease: true,
    available_from: null, available_to: null, distance_to_campus: '0.7 mi',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
]

type QuickFilter = 'Furnished' | 'Pet Friendly' | 'Sublets'
const QUICK_FILTERS: QuickFilter[] = ['Furnished', 'Pet Friendly', 'Sublets']
const SORTS = ['Newest', 'Price: Low', 'Price: High']

/** Masks the house number in an address, e.g. "1412 Audubon St" → "14XX Audubon St" */
function maskAddress(address: string): string {
  return address.replace(/^(\d{1,2})\d+/, (_, prefix: string) => `${prefix}XX`)
}

export function HomeClient({
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [activeFilter, setActiveFilter] = useState<QuickFilter | null>(null)
  const [activeSort, setActiveSort] = useState('Newest')
  const listingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsAuthenticated(true)
        setUserId(data.session.user.id)
        supabase
          .from('profiles')
          .select('saved_listings')
          .eq('user_id', data.session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setSavedIds(new Set((profile as { saved_listings: string[] }).saved_listings ?? []))
          })
      }
    })
  }, [])

  // Use mock data when DB is empty and not in loading/error state
  const sourceListings = (!loading && !error && initialListings.length === 0)
    ? MOCK_LISTINGS
    : initialListings
  const isMockData = sourceListings === MOCK_LISTINGS

  const filtered = useMemo(() => {
    let list = [...sourceListings]
    if (activeFilter === 'Furnished') list = list.filter(l => l.furnished)
    else if (activeFilter === 'Pet Friendly') list = list.filter(l => l.pets)
    else if (activeFilter === 'Sublets') list = list.filter(l => l.is_sublease)
    if (activeSort === 'Price: Low') list.sort((a, b) => a.rent - b.rent)
    else if (activeSort === 'Price: High') list.sort((a, b) => b.rent - a.rent)
    return list
  }, [sourceListings, activeFilter, activeSort])

  function handleFilterPill(f: QuickFilter) {
    const next = activeFilter === f ? null : f
    setActiveFilter(next)
    // Smooth-scroll to the listings section after filter change
    setTimeout(() => {
      listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleCreate() {
    if (isAuthenticated) router.push('/listings/new')
    else router.push('/login?next=/listings/new')
  }

  async function handleSave(id: string) {
    if (isMockData) return
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

  const headline = 'Student Housing, Done Right.'.split(' ')

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      {/* Hero */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg, var(--olive) 0%, var(--olive-dark) 100%)', paddingTop: 'calc(72px + env(safe-area-inset-top))', paddingBottom: 64, overflow: 'hidden' }}>
        {/* Animated grid */}
        <div className="hero-grid" style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
          <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 99, padding: '5px 14px', marginBottom: 16 }}
          >
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.01em' }}>
              Built for students · @tulane.edu login required
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            style={{
              fontFamily: 'var(--font-playfair)', fontWeight: 800,
              fontSize: 'clamp(32px, 7vw, 56px)', color: 'white', lineHeight: 1.1,
              margin: '0 0 16px',
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em',
            }}
          >
            {headline.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, lineHeight: 1.6 }}
          >
            Verified apartments, sublets, and roommates — built for students.
          </motion.p>

          {/* Filter pills — sole discovery mechanism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {QUICK_FILTERS.map(f => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleFilterPill(f)}
                style={{
                  background: activeFilter === f ? 'white' : 'rgba(255,255,255,0.12)',
                  color: activeFilter === f ? 'var(--olive)' : 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 99, padding: '6px 14px', fontSize: 13,
                  fontFamily: 'var(--font-dm-sans)', fontWeight: activeFilter === f ? 700 : 400,
                  cursor: 'pointer', transition: 'background 0.2s ease, color 0.2s ease',
                }}
              >
                {f}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="wave-divider" style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48 Z" fill="var(--surface)" />
          </svg>
        </div>
      </div>

      {/* Trust badge */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 16px 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'white', border: '1px solid rgba(0,103,71,0.12)',
            borderRadius: 99, padding: '10px 20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <Shield size={15} color="var(--olive)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--olive)', fontWeight: 600 }}>
            100% Verified Tulane Users · Student-Only Community
          </span>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px' }}>

        {/* Listings section — full grid, no pagination gate */}
        <div ref={listingsRef} style={{ paddingTop: 40, scrollMarginTop: 'calc(56px + env(safe-area-inset-top) + 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600, color: 'var(--olive)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                {activeFilter ? activeFilter.toUpperCase() : 'FRESH PICKS'}
              </p>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {activeFilter ? `${activeFilter} Listings` : 'Featured Listings'}
              </h2>
            </div>
            {/* Sort pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {SORTS.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveSort(s)}
                  style={{
                    padding: '5px 12px', borderRadius: 99, fontSize: 12,
                    fontFamily: 'var(--font-dm-sans)', fontWeight: activeSort === s ? 600 : 400,
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

          {/* Loading state */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[1, 2, 3, 4, 5, 6].map(i => <ListingSkeleton key={i} />)}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Could not load listings</p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{error}</p>
              {onRetry && <Button label="Try Again" onClick={onRetry} variant="primary" />}
            </div>
          )}

          {/* Listings grid */}
          {!loading && !error && (
            <>
              {isMockData && (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, background: 'rgba(0,103,71,0.06)', borderRadius: 8, padding: '6px 12px', display: 'inline-block' }}>
                  Sample listings — be the first to post
                </p>
              )}

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <Home size={48} color="var(--text-muted)" strokeWidth={1.5} />
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No matches</h3>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>Try a different filter.</p>
                  <button
                    onClick={() => setActiveFilter(null)}
                    style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                  >
                    Show all listings
                  </button>
                </div>
              ) : (
                <>
                  <ListingGrid
                    listings={filtered}
                    onCardClick={() => {}}
                    onSave={handleSave}
                    savedIds={savedIds}
                  />
                  {hasMore && activeFilter === null && !isMockData && (
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
                </>
              )}
            </>
          )}
        </div>

        {/* How It Works */}
        <Section>
          <SectionItem index={0}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, margin: '48px 0 24px', color: 'var(--text-primary)' }}>How It Works</h2>
          </SectionItem>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                num: '01',
                title: 'Verify with @tulane.edu',
                desc: 'Sign up in seconds using your university email. A 6-digit code is sent to your @tulane.edu address — no password required.',
                icon: <Shield size={20} color="var(--olive)" />,
              },
              {
                num: '02',
                title: 'Browse vetted Uptown listings',
                desc: 'Every property is in a student-friendly Uptown neighborhood, posted by a verified WaveRow user.',
                icon: <Search size={20} color="var(--olive)" />,
              },
              {
                num: '03',
                title: 'Securely message landlords or find roommates',
                desc: 'Message landlords or students directly through WaveRow — no middleman, no third-party apps.',
                icon: <MessageCircle size={20} color="var(--olive)" />,
              },
            ].map((step, i) => (
              <SectionItem key={step.num} index={i + 1}>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, fontSize: 13, color: 'rgba(0,103,71,0.3)', letterSpacing: '0.04em' }}>{step.num}</span>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{step.title}</h3>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              </SectionItem>
            ))}
          </div>
        </Section>

        {/* Platform Features */}
        <div style={{ paddingBottom: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Platform Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              {
                icon: <Calendar size={22} color="var(--olive)" />,
                title: 'Short-Term Sublets',
                desc: 'Going abroad or leaving for the summer? Find and post semester sublets from fellow students.',
                href: '/sublets',
              },
              {
                icon: <Users size={22} color="var(--olive)" />,
                title: 'Roommate Matching',
                desc: 'Browse roommate profiles, filter by budget and lifestyle, and form groups — all in one place.',
                href: '/roommates',
              },
            ].map(feat => (
              <motion.div
                key={feat.title}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={feat.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {feat.icon}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{feat.title}</h3>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

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
    </div>
  )
}
