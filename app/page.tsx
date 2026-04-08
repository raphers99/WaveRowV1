'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HomeClient } from './HomeClient'
import type { Listing } from '@/types'

const PAGE_SIZE = 40

function HomeInner() {
  const searchParams = useSearchParams()

  // Filter params from URL — these are the source of truth
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
  const [initialLoading, setInitialLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  // null = checking, false = logged out, true = logged in
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Resolve auth once on mount
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
  }, [furnished, pets, sublet, beds, priceMax, sort])

  // Fetch when auth resolves (and only when logged in)
  useEffect(() => {
    if (isAuthenticated !== true) return
    setPage(0)
    setInitialLoading(true)
    fetchPage(0, true)
  }, [isAuthenticated, fetchPage])

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
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />}>
      <HomeInner />
    </Suspense>
  )
}
