'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ListingsClient } from './ListingsClient'
import type { Listing } from '@/types'

const PAGE_SIZE = 40

function ListingsPageInner() {
  const [listings, setListings] = useState<Listing[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchPage = useCallback(async (pageIndex: number, replace: boolean) => {
    try {
      const { data, error } = await createClient()
        .from('listings')
        .select('id, user_id, title, type, address, rent, beds, baths, furnished, pets, utilities, photos, is_sublease')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)

      if (error) throw error
      const results = (data ?? []) as Listing[]
      if (replace) setListings(results)
      else setListings(prev => [...prev, ...results])
      setHasMore(results.length === PAGE_SIZE)
      setFetchError(null)
    } catch (err) {
      console.error('[ListingsPage] fetch failed:', err)
      setFetchError('Could not load listings. Please try again.')
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(0, true)
  }, [fetchPage])

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
    <ListingsClient
      initialListings={listings}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={loadMore}
      loading={initialLoading}
      error={fetchError}
      onRetry={retry}
    />
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />}>
      <ListingsPageInner />
    </Suspense>
  )
}
