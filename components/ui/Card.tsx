'use client'
import { motion } from 'framer-motion'
import { cardHover } from '@/lib/motion'
import type { CardProps } from '@/types'

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <motion.div
      className={`card ${className}`}
      {...cardHover}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </motion.div>
  )
}
