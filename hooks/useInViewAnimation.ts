'use client'
import { useRef } from 'react'
import { useInView } from 'framer-motion'

export function useInViewAnimation() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return { ref, isInView }
}
