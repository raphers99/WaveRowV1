'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackScreenView, startTrace } from '@/lib/analytics'

/**
 * Auto-tracks screen views and measures time-to-interactive per route.
 * Drop into any always-mounted component (AppShell).
 */
export function usePageTracking(): void {
  const pathname = usePathname()
  const traceRef = useRef<ReturnType<typeof startTrace> | null>(null)

  useEffect(() => {
    // Finish previous trace if it never finished (navigation cut it short)
    traceRef.current?.finish()
    traceRef.current = startTrace(pathname)

    trackScreenView(pathname)

    // Finish trace after first paint settles
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        traceRef.current?.finish()
        traceRef.current = null
      })
    })

    return () => {
      cancelAnimationFrame(id)
      traceRef.current?.finish()
      traceRef.current = null
    }
  }, [pathname])
}
