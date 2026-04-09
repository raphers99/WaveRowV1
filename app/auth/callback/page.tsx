'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (!code) {
      router.replace('/login?error=auth')
      return
    }

    const supabase = createClient()
    
    // Process the OAuth payload strictly inside the browser environment for static export compatibility
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login?error=auth')
        return
      }

      const email = data.user.email ?? ''

      // Execute explicit client-side domain rejection
      if (!email.endsWith('@tulane.edu')) {
        supabase.auth.signOut().then(() => {
          router.replace('/login?error=not_tulane')
        })
        return
      }

      router.replace(next)
    }).catch(() => {
      router.replace('/login?error=auth')
    })
  }, [router, searchParams])

  return <div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />}>
      <AuthCallbackInner />
    </Suspense>
  )
}
