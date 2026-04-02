'use client'
import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/motion'
import type { SectionProps } from '@/types'

export function Section({ children }: SectionProps) {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.section>
  )
}
