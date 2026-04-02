'use client'
import { motion } from 'framer-motion'
import { scaleTap } from '@/lib/motion'
import type { IconButtonProps } from '@/types'

export function IconButton({ icon, onClick, ariaLabel }: IconButtonProps) {
  return (
    <motion.button
      {...scaleTap}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 44, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer',
        borderRadius: '50%'
      }}
    >
      {icon}
    </motion.button>
  )
}
