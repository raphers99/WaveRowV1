'use client'
import { motion } from 'framer-motion'
import { scaleTap } from '@/lib/motion'
import type { ButtonProps } from '@/types'

export function Button({ label, onClick, variant, disabled }: ButtonProps) {
  return (
    <motion.button
      {...scaleTap}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      className={`btn-${variant}`}
    >
      {label}
    </motion.button>
  )
}
