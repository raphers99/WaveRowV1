'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HomeClient } from './HomeClient'
import type { Listing } from '@/types'

const PAGE_SIZE = 40

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lock, Plus, Search } from 'lucide-react'

// ─── Hero Component ───
function Hero({ isAuthenticated }: { isAuthenticated: boolean | null }) {
  const headline = 'Find Your Next Place Near Tulane'.split(' ')

  return (
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

      <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 99, padding: '5px 14px', marginBottom: 20 }}
        >
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            100% Verified Tulane Users · Student-Only Community
          </span>
        </motion.div>

        <motion.h1 style={{
          fontFamily: 'var(--font-playfair)', fontWeight: 800,
          fontSize: 'clamp(38px, 6vw, 64px)', color: 'white', lineHeight: 1.1,
          margin: '0 0 24px',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em',
        }}>
          {headline.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(16px, 3vw, 18px)', color: 'rgba(255,255,255,0.85)', marginBottom: 40, lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px' }}
        >
          WaveRow is a student housing marketplace for Tulane University — securely find sublets, semester leases, and trusted roommates in New Orleans.
        </motion.p>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {isAuthenticated === false ? (
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'white', color: 'var(--olive)',
                borderRadius: 12, padding: '14px 28px',
                fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16,
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}
            >
              <Lock size={18} />
              Log in to View
            </Link>
          ) : (
            <a
              href="#listings"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'white', color: 'var(--olive)',
                borderRadius: 12, padding: '14px 28px',
                fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16,
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}
            >
              <Search size={18} />
              Browse Listings
            </a>
          )}
          
          <Link
            href={isAuthenticated ? "/listings/new" : "/login?next=/listings/new"}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 12, padding: '14px 28px',
              fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16,
              textDecoration: 'none',
            }}
          >
            <Plus size={18} />
            List Your Place
          </Link>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48 Z" fill="var(--surface)" />
        </svg>
      </div>
    </div>
  )
}

function ListingsFetcher({ isAuthenticated, userId, setInitialLoading, initialLoading }: { isAuthenticated: boolean | null, userId: string | null, setInitialLoading: (state: boolean) => void, initialLoading: boolean }) {
  const searchParams = useSearchParams()

  const furnished = searchParams.get('furnished') === 'true'
  const pets = searchParams.get('pets') === 'true'
  const sublet = searchParams.get('sublet') === 'true'
  const bedsParam = searchParams.get('beds')
  const beds = bedsParam ? parseInt(bedsParam, 10) : null
  const priceMaxParam = searchParams.get('price_max')
  const priceMax = priceMaxParam ? parseInt(priceMaxParam, 10) : null
  const sort = searchParams.get('sort') ?? 'newest'

  const [listings, setListings] = useState<Listing[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchPage = useCallback(async (pageIndex: number, replace: boolean) => {
    const supabase = createClient()
    let query = supabase
      .from('listings')
      .select('id, user_id, title, type, address, rent, beds, baths, furnished, pets, utilities, photos, is_sublease')
      .eq('status', 'ACTIVE')
      .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)

    if (furnished) query = query.eq('furnished', true)
    if (pets) query = query.eq('pets', true)
    if (sublet) query = query.eq('is_sublease', true)
    if (beds !== null) query = query.gte('beds', beds)
    if (priceMax !== null) query = query.lte('rent', priceMax)
    if (sort === 'price_asc') query = query.order('rent', { ascending: true })
    else if (sort === 'price_desc') query = query.order('rent', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    try {
      const { data, error } = await query
      if (error) throw error
      const results = (data ?? []) as Listing[]
      if (replace) setListings(results)
      else setListings(prev => [...prev, ...results])
      setHasMore(results.length === PAGE_SIZE)
      setFetchError(null)
    } catch {
      setFetchError('Could not load listings. Please try again.')
    } finally {
      setInitialLoading(false)
    }
  }, [furnished, pets, sublet, beds, priceMax, sort, setInitialLoading])

  useEffect(() => {
    if (isAuthenticated !== true) return
    setPage(0)
    setInitialLoading(true)
    fetchPage(0, true)
  }, [isAuthenticated, fetchPage, setInitialLoading])

  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const next = page + 1
    setPage(next)
    await fetchPage(next, false)
    setLoadingMore(false)
  }

  function retry() {
    setFetchError(null)
    setInitialLoading(true)
    fetchPage(0, true)
  }

  return (
    <div id="listings">
      <HomeClient
        initialListings={listings}
        isAuthenticated={isAuthenticated}
        userId={userId}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        loading={initialLoading}
        error={fetchError}
        onRetry={retry}
      />
    </div>
  )
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsAuthenticated(true)
        setUserId(data.session.user.id)
      } else {
        setIsAuthenticated(false)
        setInitialLoading(false)
      }
    })
  }, [])

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <Suspense fallback={<div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading listings...</div>}>
        <ListingsFetcher 
          isAuthenticated={isAuthenticated} 
          userId={userId} 
          setInitialLoading={setInitialLoading}
          initialLoading={initialLoading} 
        />
      </Suspense>
    </>
  )
}
