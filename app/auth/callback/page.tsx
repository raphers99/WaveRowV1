'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    if (code) {
      createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        .auth.exchangeCodeForSession(code)
        .then(() => router.replace(next))
        .catch(() => router.replace('/login?error=auth'))
    } else {
      router.replace('/login?error=auth')
    }
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
