'use client'
import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { MapPin, Bed, Bath } from 'lucide-react'
import { SwipeIndicators } from './SwipeIndicators'
import type { SwipeCardProps, SwipeAction } from '@/types'

const SWIPE_THRESHOLD = 100

export function SwipeCard({ listing, onSwipe }: SwipeCardProps) {
  const [direction, setDirection] = useState<SwipeAction | null>(null)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const { offset, velocity } = info
    if (velocity.x > 500 || offset.x > SWIPE_THRESHOLD) onSwipe('like')
    else if (velocity.x < -500 || offset.x < -SWIPE_THRESHOLD) onSwipe('dislike')
    else setDirection(null)
  }

  const photo = listing.photos[0]

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      style={{ x, rotate, opacity, cursor: 'grab', position: 'relative', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden', touchAction: 'none' }}
      onDrag={(_, info) => {
        if (info.offset.x > 30) setDirection('like')
        else if (info.offset.x < -30) setDirection('dislike')
        else setDirection(null)
      }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {photo ? (
        <img src={photo} alt={listing.title ?? listing.address} style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none' }} draggable={false} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'var(--olive-light)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
      <SwipeIndicators direction={direction} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 24px' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 26, color: 'white', margin: '0 0 6px' }}>${listing.rent.toLocaleString()}/mo</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}><Bed size={14} />{listing.beds} bed</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}><Bath size={14} />{listing.baths} bath</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}><MapPin size={12} />{listing.neighborhood ?? listing.address}</span>
      </div>
    </motion.div>
  )
}
