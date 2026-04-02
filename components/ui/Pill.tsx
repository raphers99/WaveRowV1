'use client'
import { motion } from 'framer-motion'
import { scaleTap } from '@/lib/motion'
import type { PillProps } from '@/types'

export function Pill({ label, active, onClick }: PillProps) {
  return (
    <motion.button
      {...scaleTap}
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
        border: active ? 'none' : '1px solid rgba(0,103,71,0.15)',
        background: active ? 'var(--olive)' : 'transparent',
        color: active ? 'white' : 'var(--text-secondary)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </motion.button>
  )
}
