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

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.user) {
        router.replace('/login?error=auth')
        return
      }

      const email = data.user.email ?? ''

      if (!email.endsWith('@tulane.edu')) {
        await supabase.auth.signOut()
        router.replace('/login?error=not_tulane')
        return
      }

      // Ensure profile row exists for this user (safe for both new and returning)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (!existing) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          name: data.user.user_metadata?.full_name ?? email.split('@')[0],
          role: 'student',
          verified: true,
          verification_status: 'verified',
          verification_type: 'student',
        })
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
