'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Shield, Home, AlertTriangle, Lock, SlidersHorizontal, X } from 'lucide-react'
import { Button, toast } from '@/components/ui'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import { saveListing, unsaveListing } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import { createClient } from '@/lib/supabase/client'
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

const AVAILABLE_DATES = [
  { label: 'Fall 2025', val: '2025-08' },
  { label: 'Spring 2026', val: '2026-01' },
  { label: 'Summer 2026', val: '2026-05' },
  { label: 'Fall 2026', val: '2026-08' },
  { label: 'Spring 2027', val: '2027-01' },
  { label: 'Summer 2027', val: '2027-05' },
]

function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  // Read current params
  const beds = searchParams.get('beds')
  const priceMin = searchParams.get('price_min') ?? ''
  const priceMax = searchParams.get('price_max') ?? ''
  const furnished = searchParams.get('furnished') === 'true'
  const available = searchParams.get('available') ?? ''
  const sort = searchParams.get('sort') ?? ''
  const distance = searchParams.get('distance') ?? ''

  // Local draft state — only committed on "Show Results"
  const [draftBeds, setDraftBeds] = useState(beds ?? '')
  const [draftPriceMin, setDraftPriceMin] = useState(priceMin)
  const [draftPriceMax, setDraftPriceMax] = useState(priceMax)
  const [draftFurnished, setDraftFurnished] = useState(furnished)
  const [draftAvailable, setDraftAvailable] = useState(available)
  const [draftSort, setDraftSort] = useState(sort)
  const [draftDistance, setDraftDistance] = useState(distance || '2')

  // Sync draft when sheet opens
  function handleOpen() {
    setDraftBeds(beds ?? '')
    setDraftPriceMin(priceMin)
    setDraftPriceMax(priceMax)
    setDraftFurnished(furnished)
    setDraftAvailable(available)
    setDraftSort(sort)
    setDraftDistance(distance || '2')
    setOpen(true)
  }

  function applyFilters() {
    router.push(buildUrl(searchParams, {
      beds: draftBeds || null,
      price_min: draftPriceMin || null,
      price_max: draftPriceMax || null,
      furnished: draftFurnished ? 'true' : null,
      available: draftAvailable || null,
      sort: draftSort || null,
      distance: draftDistance !== '2' ? draftDistance : null,
    }), { scroll: false })
    setOpen(false)
  }

  function clearAll() {
    router.push(buildUrl(searchParams, {
      beds: null, price_min: null, price_max: null,
      furnished: null, available: null, sort: null, distance: null,
    }), { scroll: false })
    setOpen(false)
  }

  const activeCount = [
    !!beds, !!priceMin, !!priceMax, furnished, !!available, !!sort, !!distance,
  ].filter(Boolean).length

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-dm-sans)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--olive)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 10,
  }

  const pillBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: '8px 18px',
        borderRadius: 99,
        fontFamily: 'var(--font-dm-sans)',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        background: active ? 'var(--olive)' : 'white',
        color: active ? 'white' : 'var(--text-primary)',
        border: `1.5px solid ${active ? 'var(--olive)' : 'rgba(0,0,0,0.12)'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <>
      {/* Trigger button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 16px',
            borderRadius: 99,
            background: activeCount > 0 ? 'var(--olive)' : 'white',
            color: activeCount > 0 ? 'white' : 'var(--text-primary)',
            border: `1.5px solid ${activeCount > 0 ? 'var(--olive)' : 'rgba(0,0,0,0.12)'}`,
            fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
          aria-label="Open filters"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span style={{
              background: 'white', color: 'var(--olive)',
              borderRadius: 99, fontSize: 11, fontWeight: 700,
              padding: '1px 6px', lineHeight: 1.4,
            }}>{activeCount}</span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans)', fontSize: 13,
              color: 'var(--text-muted)', padding: '4px 8px',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 200,
            }}
          />
        )}
      </AnimatePresence>

      {/* Filter sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: 'white',
              borderRadius: '20px 20px 0 0',
              zIndex: 201,
              maxHeight: '88dvh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
            }}
          >
            {/* Sheet header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px 14px',
              borderBottom: '0.5px solid rgba(0,0,0,0.08)',
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Filters</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

              {/* RENT */}
              <p style={sectionLabel}>Rent</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={draftPriceMin}
                  onChange={e => setDraftPriceMin(e.target.value)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid rgba(0,0,0,0.12)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: 15,
                    color: 'var(--text-primary)', background: 'var(--surface)',
                    outline: 'none',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--text-muted)', fontSize: 16 }}>–</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={draftPriceMax}
                  onChange={e => setDraftPriceMax(e.target.value)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid rgba(0,0,0,0.12)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: 15,
                    color: 'var(--text-primary)', background: 'var(--surface)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* BEDS */}
              <p style={sectionLabel}>Beds</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  { label: 'Any', val: '' },
                  { label: '1', val: '1' },
                  { label: '2', val: '2' },
                  { label: '3', val: '3' },
                  { label: '4+', val: '4' },
                ].map(b => pillBtn(b.label, draftBeds === b.val, () => setDraftBeds(b.val)))}
              </div>

              {/* AVAILABLE DATE */}
              <p style={sectionLabel}>Available Date</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {AVAILABLE_DATES.map(d => pillBtn(
                  d.label,
                  draftAvailable === d.val,
                  () => setDraftAvailable(draftAvailable === d.val ? '' : d.val),
                ))}
              </div>

              {/* FURNISHED */}
              <p style={sectionLabel}>Furnished</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {pillBtn('Any', !draftFurnished, () => setDraftFurnished(false))}
                {pillBtn('Furnished', draftFurnished, () => setDraftFurnished(true))}
              </div>

              {/* SORT BY */}
              <p style={sectionLabel}>Sort By</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {pillBtn('Newest', draftSort === '' || draftSort === 'newest', () => setDraftSort('newest'))}
                {pillBtn('Price: Low → High', draftSort === 'price_asc', () => setDraftSort('price_asc'))}
                {pillBtn('Price: High → Low', draftSort === 'price_desc', () => setDraftSort('price_desc'))}
              </div>

              {/* DISTANCE FROM CAMPUS */}
              <p style={sectionLabel}>Distance from Campus</p>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
                    Within <strong style={{ color: 'var(--olive)' }}>{parseFloat(draftDistance).toFixed(1)} mi</strong> of campus
                  </span>
                  {draftDistance !== '2' && (
                    <button onClick={() => setDraftDistance('2')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', padding: 0 }}>
                      Reset
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2"
                  step="0.25"
                  value={draftDistance}
                  onChange={e => setDraftDistance(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--olive)', cursor: 'pointer', height: 4 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--text-muted)' }}>0.25 mi</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--text-muted)' }}>2 mi</span>
                </div>
              </div>

            </div>

            {/* Sticky footer */}
            <div style={{
              flexShrink: 0,
              padding: '12px 20px',
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
              borderTop: '0.5px solid rgba(0,0,0,0.08)',
              background: 'white',
            }}>
              <button
                onClick={applyFilters}
                style={{
                  width: '100%', background: 'var(--olive)', color: 'white',
                  border: 'none', borderRadius: 14, padding: '14px',
                  fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                Show Results
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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

  const headline = 'Student Housing, Done Right.'.split(' ')

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(160deg, var(--olive) 0%, var(--olive-dark) 100%)',
        paddingTop: 'calc(72px + env(safe-area-inset-top))',
        paddingBottom: 64,
        overflow: 'hidden',
      }}>
        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
          <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 99, padding: '5px 14px', marginBottom: 16 }}
          >
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              Built for students · @tulane.edu login required
            </span>
          </motion.div>

          <motion.h1 style={{
            fontFamily: 'var(--font-playfair)', fontWeight: 800,
            fontSize: 'clamp(32px, 7vw, 56px)', color: 'white', lineHeight: 1.1,
            margin: '0 0 16px',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em',
          }}>
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

          {/* Auth CTA for logged-out users */}
          {isAuthenticated === false && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <Link
                href="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'white', color: 'var(--olive)',
                  borderRadius: 12, padding: '12px 28px',
                  fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 15,
                  textDecoration: 'none',
                }}
              >
                <Lock size={16} />
                Log in with your student email
              </Link>
            </motion.div>
          )}
        </div>

        {/* Wave divider */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48 Z" fill="var(--surface)" />
          </svg>
        </div>
      </div>

      {/* ── Trust badge ── */}
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

      <div className="mx-auto px-4 md:px-6 lg:px-8 w-full max-w-[1080px] xl:max-w-[1400px] 2xl:max-w-screen-2xl">

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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 md:gap-6 lg:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ListingSkeleton key={i} />)}
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
