'use client'
import { useState, useEffect } from 'react'

export function useScrollTrigger(threshold = 60) {
  const [triggered, setTriggered] = useState(false)
  useEffect(() => {
    const onScroll = () => setTriggered(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return triggered
}
