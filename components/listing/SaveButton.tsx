'use client'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import type { SaveButtonProps } from '@/types'

export function SaveButton({ isSaved, onToggle }: SaveButtonProps) {
  return (
    <motion.button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle() }}
      whileTap={{ scale: 0.8 }}
      animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-label={isSaved ? 'Unsave listing' : 'Save listing'}
    >
      <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} stroke={isSaved ? '#ef4444' : 'var(--text-muted)'} strokeWidth={2} />
    </motion.button>
  )
}
