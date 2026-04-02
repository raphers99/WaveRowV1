import { Bed, Bath, MapPin } from 'lucide-react'
import type { ListingMetaProps } from '@/types'

export function ListingMeta({ beds, baths, location }: ListingMetaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}><Bed size={13} />{beds} bed</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}><Bath size={13} />{baths} bath</span>
      </div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)' }}><MapPin size={12} />{location}</span>
    </div>
  )
}
