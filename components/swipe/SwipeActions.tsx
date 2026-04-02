'use client'
import { motion } from 'framer-motion'
import { X, Heart, RotateCcw } from 'lucide-react'
import type { SwipeActionsProps } from '@/types'

export function SwipeActions({ onLike, onDislike, onUndo }: SwipeActionsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '20px 0' }}>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onDislike}
        style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #fecaca', color: '#ef4444', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        aria-label="Skip">
        <X size={22} strokeWidth={2.5} />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onUndo}
        style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid rgba(0,103,71,0.2)', color: 'var(--text-muted)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Undo">
        <RotateCcw size={16} />
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onLike}
        style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--olive)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,103,71,0.4)' }}
        aria-label="Save">
        <Heart size={26} strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}
