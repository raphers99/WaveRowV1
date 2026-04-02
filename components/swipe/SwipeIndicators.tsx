'use client'
import { motion } from 'framer-motion'
import { X, Heart } from 'lucide-react'
import type { SwipeIndicatorsProps } from '@/types'

export function SwipeIndicators({ direction }: SwipeIndicatorsProps) {
  return (
    <>
      <motion.div animate={{ opacity: direction === 'dislike' ? 1 : 0 }} transition={{ duration: 0.15 }}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(239,68,68,0.9)', color: 'white', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-dm-sans)' }}>
        <X size={18} /> SKIP
      </motion.div>
      <motion.div animate={{ opacity: direction === 'like' ? 1 : 0 }} transition={{ duration: 0.15 }}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: 'rgba(0,103,71,0.9)', color: 'white', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-dm-sans)' }}>
        <Heart size={18} /> SAVE
      </motion.div>
    </>
  )
}
