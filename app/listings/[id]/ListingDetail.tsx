'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Bed, Bath, Square, MapPin, Wifi, Car, WashingMachine, Thermometer, Dog, Dumbbell, Waves, Utensils, Zap } from 'lucide-react'
import { PriceTag } from '@/components/listing/PriceTag'
import { SubletBadge } from '@/components/listing/SubletBadge'
import { fadeUp } from '@/lib/motion'
import type { Listing } from '@/types'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wifi': <Wifi size={14} />, 'Parking': <Car size={14} />, 'Washer/Dryer': <WashingMachine size={14} />,
  'AC': <Thermometer size={14} />, 'Pet Friendly': <Dog size={14} />, 'Gym': <Dumbbell size={14} />,
  'Pool': <Waves size={14} />, 'Dishwasher': <Utensils size={14} />, 'Utilities': <Zap size={14} />,
}

export function ListingDetail({ listing }: { listing: Listing }) {
  const router = useRouter()
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = listing.photos.length > 0 ? listing.photos : ['']

  function prev() { setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }
  function next() { setPhotoIndex(i => (i + 1) % photos.length) }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 120, minHeight: '100dvh', background: 'var(--surface)' }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{ position: 'fixed', top: 'calc(64px + env(safe-area-inset-top))', left: 16, zIndex: 30, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
        aria-label="Back"
      >
        <ChevronLeft size={20} color="var(--text-primary)" />
      </button>

      {/* Photo gallery */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--olive-light)' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={photoIndex}
            src={photos[photoIndex]}
            alt={listing.title ?? listing.address}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous photo" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} aria-label="Next photo" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={18} />
            </button>
            {/* Thumbnail strip */}
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {photos.map((_, i) => (
                <button key={i} onClick={() => setPhotoIndex(i)} aria-label={`Photo ${i + 1}`} style={{ width: i === photoIndex ? 20 : 6, height: 6, borderRadius: 3, background: i === photoIndex ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'width 0.2s', padding: 0 }} />
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <PriceTag price={listing.rent} />
            {listing.is_sublease && <SubletBadge />}
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 16, margin: '12px 0', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)' }}><Bed size={16} />{listing.beds} bed{listing.beds !== 1 ? 's' : ''}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)' }}><Bath size={16} />{listing.baths} bath{listing.baths !== 1 ? 's' : ''}</span>
            {listing.sqft && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)' }}><Square size={16} />{listing.sqft.toLocaleString()} sqft</span>}
          </div>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>
            <MapPin size={14} />{listing.address}{listing.neighborhood && `, ${listing.neighborhood}`}
          </p>

          {/* Description */}
          {listing.description && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>About this place</h3>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{listing.description}</p>
            </div>
          )}

          {/* Features */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {listing.furnished && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Furnished</span>}
            {listing.pets && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Pets OK</span>}
            {listing.utilities && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Utilities Included</span>}
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Amenities</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {listing.amenities.map(a => (
                  <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'white', border: '1px solid rgba(0,103,71,0.12)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-dm-sans)' }}>
                    {AMENITY_ICONS[a] ?? null}{a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {listing.available_from && (
            <div style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid rgba(0,103,71,0.08)', marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>Available from</p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {new Date(listing.available_from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sticky price bar */}
      <div style={{ position: 'fixed', bottom: 'calc(64px + env(safe-area-inset-bottom))', left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '0.5px solid rgba(0,103,71,0.1)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40 }}>
        <PriceTag price={listing.rent} />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
        >
          Contact Landlord
        </motion.button>
      </div>
    </div>
  )
}
