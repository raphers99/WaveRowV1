'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cardHover } from '@/lib/motion'
import { ListingImage } from './ListingImage'
import { PriceTag } from './PriceTag'
import { ListingMeta } from './ListingMeta'
import { SaveButton } from './SaveButton'
import { SubletBadge } from './SubletBadge'
import type { ListingCardProps } from '@/types'

export function ListingCard({ listing, onClick, onSave }: ListingCardProps) {
  const [saved, setSaved] = useState(false)

  function handleSave(id: string) {
    setSaved(s => !s)
    onSave(id)
  }

  return (
    <Link href={`/listings/${listing.id}`} onClick={() => onClick(listing.id)} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        {...cardHover}
        style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(0,103,71,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}
      >
        <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
          <ListingImage src={listing.photos[0]} alt={listing.title ?? listing.address} />
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <SaveButton isSaved={saved} onToggle={() => handleSave(listing.id)} />
          </div>
          {listing.is_sublease && <div style={{ position: 'absolute', top: 10, left: 10 }}><SubletBadge /></div>}
        </div>
        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <PriceTag price={listing.rent} />
          </div>
          <ListingMeta beds={listing.beds} baths={listing.baths} location={listing.neighborhood ?? listing.address} />
          {(listing.furnished || listing.pets || listing.utilities) && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {listing.furnished && <span style={{ fontSize: 11, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', padding: '2px 8px', borderRadius: 99 }}>Furnished</span>}
              {listing.pets && <span style={{ fontSize: 11, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', padding: '2px 8px', borderRadius: 99 }}>Pets OK</span>}
              {listing.utilities && <span style={{ fontSize: 11, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', padding: '2px 8px', borderRadius: 99 }}>Utilities</span>}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
