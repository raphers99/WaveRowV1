'use client'
import { motion } from 'framer-motion'

export function NavIndicator() {
  return (
    <motion.div
      layoutId="navDot"
      style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--olive)', position: 'absolute', bottom: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    />
  )
}
