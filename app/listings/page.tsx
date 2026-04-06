'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ListingsClient } from './ListingsClient'
import type { Listing } from '@/types'

const PAGE_SIZE = 40

function ListingsPageInner() {
  const [listings, setListings] = useState<Listing[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)

  const fetchPage = useCallback(async (pageIndex: number, replace: boolean) => {
    try {
      const { data } = await createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
        .from('listings')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)

      const results = (data ?? []) as Listing[]
      if (replace) setListings(results)
      else setListings(prev => [...prev, ...results])
      setHasMore(results.length === PAGE_SIZE)
    } catch {}
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

  return <ListingsClient initialListings={listings} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore} />
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />}>
      <ListingsPageInner />
    </Suspense>
  )
}
