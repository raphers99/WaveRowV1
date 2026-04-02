'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Home } from 'lucide-react'
import { Pill, Button } from '@/components/ui'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { saveListing, unsaveListing } from '@/lib/api'
import type { Listing } from '@/types'

const TYPES = ['All', 'APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM']
const TYPE_LABELS: Record<string, string> = {
  All: 'All', APARTMENT: 'Apartment', HOUSE: 'House', STUDIO: 'Studio', SHARED_ROOM: 'Room',
}
const SORTS = ['Newest', 'Price: Low', 'Price: High']

export function ListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const searchParams = useSearchParams()
  const [activeType, setActiveType] = useState('All')
  const [activeSort, setActiveSort] = useState('Newest')
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let list = [...initialListings]
    if (activeType !== 'All') list = list.filter(l => l.type === activeType)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.address.toLowerCase().includes(q) ||
        (l.neighborhood ?? '').toLowerCase().includes(q) ||
        (l.title ?? '').toLowerCase().includes(q)
      )
    }
    if (activeSort === 'Price: Low') list.sort((a, b) => a.rent - b.rent)
    else if (activeSort === 'Price: High') list.sort((a, b) => b.rent - a.rent)
    return list
  }, [initialListings, activeType, activeSort, search])

  async function handleSave(id: string) {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); unsaveListing('', id).catch(() => {}) }
      else { next.add(id); saveListing('', id).catch(() => {}) }
      return next
    })
  }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 'calc(56px + env(safe-area-inset-top))', zIndex: 40, background: 'rgba(242,242,247,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(0,103,71,0.08)', padding: '10px 16px' }}>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search listings..."
          style={{ width: '100%', background: 'white', border: '1px solid rgba(0,103,71,0.12)', borderRadius: 12, padding: '10px 14px', fontFamily: 'var(--font-dm-sans)', fontSize: 15, outline: 'none', color: 'var(--text-primary)', boxSizing: 'border-box' }}
        />
        {/* Type pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, marginTop: 10, scrollSnapType: 'x mandatory' }}>
          {TYPES.map(t => (
            <div key={t} style={{ position: 'relative', flexShrink: 0, scrollSnapAlign: 'start' }}>
              <Pill label={TYPE_LABELS[t]} active={activeType === t} onClick={() => setActiveType(t)} />
              {activeType === t && (
                <motion.div
                  layoutId="typeIndicator"
                  style={{ position: 'absolute', inset: 0, background: 'var(--olive)', borderRadius: 99, zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
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
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
        </p>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                <Home size={48} color="var(--text-muted)" strokeWidth={1.5} />
              </motion.div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No listings yet</h3>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>Be the first to list your place.</p>
              <Button label="Create a Listing" onClick={() => window.location.href = '/listings/new'} variant="primary" />
            </motion.div>
          ) : (
            <motion.div key={`${activeType}-${activeSort}-${search}`}>
              <ListingGrid
                listings={filtered}
                onCardClick={() => {}}
                onSave={handleSave}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
