'use client'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import type { SectionItemProps } from '@/types'

export function SectionItem({ children, index }: SectionItemProps) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
    >
      {children}
    </motion.div>
  )
}
