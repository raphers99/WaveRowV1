'use client'
import { ListingCard } from './ListingCard'
import type { ListingGridProps } from '@/types'

/** Plain grid — nested AnimatePresence + motion keys caused crashes on /listings (React 19 + framer-motion). */
export function ListingGrid({ listings, onCardClick, onSave, savedIds = new Set() }: ListingGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {listings.map(listing => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onClick={onCardClick}
          onSave={onSave}
          isSaved={savedIds.has(listing.id)}
        />
      ))}
    </div>
  )
}
