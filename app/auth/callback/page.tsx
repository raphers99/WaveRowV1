'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statusText, setStatusText] = useState('Signing you in…')

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

      // Domain enforcement — fallback guard; primary gate is hd queryParam at sign-in
      if (!email.endsWith('@tulane.edu')) {
        await supabase.auth.signOut()
        router.replace('/login?error=not_tulane')
        return
      }

      setStatusText('Setting up your account…')

      // Ensure profile row exists (safe for both new and returning users)
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

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(0,103,71,0.15)',
        borderTop: '3px solid #006747',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: 15,
        color: 'var(--text-muted)',
        margin: 0,
      }}>{statusText}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(0,103,71,0.15)', borderTop: '3px solid #006747', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  )
}
