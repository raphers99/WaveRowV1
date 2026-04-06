'use client'

import { useEffect } from 'react'
import { initAnalytics } from '@/lib/analytics'

/**
 * Initialises Amplitude + Sentry once on first client render.
 * Renders nothing — pure side-effect component.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics()
  }, [])

  return null
}
