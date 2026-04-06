'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard } from './SwipeCard'
import { SwipeActions } from './SwipeActions'
import { UndoToast } from './UndoToast'
import { SwipeEmptyState } from './SwipeEmptyState'
import { fetchListings } from '@/lib/api'
import type { SwipeStackProps, SwipeAction, Listing } from '@/types'

export function SwipeStack({ listings: initialListings, onSwipe }: SwipeStackProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [index, setIndex] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [undoVisible, setUndoVisible] = useState(false)
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (index >= listings.length - 3) {
      fetchListings().then(more => {
        setListings(prev => {
          const existingIds = new Set(prev.map(l => l.id))
          const newOnes = more.filter(l => !existingIds.has(l.id))
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev
        })
      }).catch(() => {})
    }
  }, [index])

  function handleSwipe(action: SwipeAction) {
    if (index >= listings.length) return
    onSwipe(listings[index].id, action)
    setHistory(h => [...h, index])
    setIndex(i => i + 1)
    if (action === 'dislike') {
      setUndoVisible(true)
      if (undoTimer) clearTimeout(undoTimer)
      const t = setTimeout(() => setUndoVisible(false), 3000)
      setUndoTimer(t)
    }
  }

  function handleUndo() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setIndex(prev)
    setUndoVisible(false)
  }

  const visible = listings.slice(index, index + 3)
  const done = index >= listings.length

  if (done) return <SwipeEmptyState onReset={() => { setIndex(0); setHistory([]) }} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 380, height: 480 }}>
        {[...visible].reverse().map((listing, i) => {
          const stackPos = visible.length - 1 - i
          const isTop = stackPos === 0
          const scale = 1 - stackPos * 0.04
          const translateY = stackPos * 12
          return (
            <motion.div
              key={listing.id}
              style={{ position: 'absolute', inset: 0, zIndex: visible.length - stackPos }}
              animate={{ scale, y: translateY, filter: isTop ? 'none' : `blur(${stackPos}px)` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {isTop ? (
                <AnimatePresence>
                  <SwipeCard listing={listing} onSwipe={handleSwipe} />
                </AnimatePresence>
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden', background: listing.photos[0] ? undefined : 'var(--olive-light)', pointerEvents: 'none' }}>
                  {listing.photos[0] && <img src={listing.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      <SwipeActions onLike={() => handleSwipe('like')} onDislike={() => handleSwipe('dislike')} onUndo={handleUndo} />
      <UndoToast visible={undoVisible} onUndo={handleUndo} />
    </div>
  )
}
