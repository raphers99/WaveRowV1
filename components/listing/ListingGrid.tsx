'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { ListingCard } from './ListingCard'
import type { ListingGridProps } from '@/types'

export function ListingGrid({ listings, onCardClick, onSave }: ListingGridProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={listings.map(l => l.id).join(',')}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}
      >
        {listings.map((listing, i) => (
          <motion.div key={listing.id} variants={fadeUp} custom={i}>
            <ListingCard listing={listing} onClick={onCardClick} onSave={onSave} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
