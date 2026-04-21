'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Protected routes that require authentication.
 * Matches the list previously enforced by proxy.ts.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/messages',
  '/listings/new',
  '/map',
  '/swipe',
  '/settings',
  '/roommates',
  '/sublets',
  '/create',
]

/**
 * Client-side auth guard that replaces the proxy.ts middleware
 * (which is incompatible with `output: 'export'`).
 *
 * Returns { isAuthenticated, userId } where:
 *   - isAuthenticated === null → still checking (show skeleton)
 *   - isAuthenticated === false → not logged in
 *   - isAuthenticated === true → session confirmed
 *
 * If the current route is protected and the user is unauthenticated,
 * this hook will redirect to /login?next=<current-path>.
 */
export function useAuthGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          setIsAuthenticated(true)
          setUserId(data.session.user.id)
        } else {
          setIsAuthenticated(false)
          setUserId(null)

          // Redirect if the current path is protected
          const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
          if (needsAuth) {
            router.replace(`/login?next=${encodeURIComponent(pathname)}`)
          }
        }
      })
      .catch((err) => {
        console.error('AuthGuard session error:', err)
        setIsAuthenticated(false)
        setUserId(null)
      })
  }, [pathname, router])

  return { isAuthenticated, userId }
}
