'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardClient } from './DashboardClient'
import { identifyUser } from '@/lib/analytics'
import type { Profile } from '@/types'

function getSupabase() {
  return createClient()
}

// Extracted so both the pre-load and pre-mount states render identical markup,
// avoiding any hydration mismatch between server shell and first client paint.
function DashboardSkeleton() {
  return (
    <div style={{
      paddingTop: 'calc(56px + env(safe-area-inset-top))',
      paddingBottom: 96,
      minHeight: '100dvh',
      background: 'var(--surface)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 0' }}>
        <div className="card" style={{ padding: '20px 20px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,103,71,0.08)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 20, width: 140, borderRadius: 8, background: 'rgba(0,103,71,0.08)', marginBottom: 8 }} />
              <div style={{ height: 14, width: 80, borderRadius: 8, background: 'rgba(0,103,71,0.06)' }} />
            </div>
          </div>
        </div>
        <div style={{ height: 44, borderRadius: 12, background: 'rgba(0,103,71,0.06)', marginBottom: 16 }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  // mountedRef prevents setState after the component unmounts mid-flight
  // (e.g. user navigates away while the profile fetch is still in progress).
  const mountedRef = useRef(true)
  const [data, setData] = useState<{
    profile: Profile | null
    userId: string
    email: string
  } | null>(null)

  // ALL hooks must be declared before any conditional return (Rules of Hooks).
  // data === null acts as the single loading gate — no separate mounted state needed.
  useEffect(() => {
    mountedRef.current = true

    ;(async () => {
      try {
        const supabase = getSupabase()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (!mountedRef.current) return
        if (sessionError) throw sessionError
        if (!session) { router.replace('/login'); return }

        // maybeSingle() returns null (not 406) when no row exists yet.
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (!mountedRef.current) return

        let profile = profileData as Profile | null

        // Safety-net for users who existed before the handle_new_user trigger
        // was applied. Run scripts/fix-profiles.sql once to eliminate this path.
        if (!profile) {
          const { data: created } = await supabase
            .from('profiles')
            .upsert(
              {
                user_id: session.user.id,
                name: session.user.email?.split('@')[0] ?? 'User',
                role: (session.user.user_metadata?.role as string | undefined) ?? 'student',
                verified: false,
                verification_status: 'unverified',
                verification_type: (session.user.user_metadata?.role as string | undefined) ?? 'student',
              },
              { onConflict: 'user_id' },
            )
            .select()
            .maybeSingle()
          if (mountedRef.current) profile = created as Profile | null
        }

        if (!mountedRef.current) return

        identifyUser(session.user.id, {
          role: profile?.role ?? 'student',
          email: session.user.email ?? '',
        })
        setData({ profile, userId: session.user.id, email: session.user.email ?? '' })
      } catch (err) {
        if (!mountedRef.current) return
        console.error('[Dashboard] auth error:', err)
        router.replace('/login')
      }
    })()

    return () => { mountedRef.current = false }
  }, [router])

  // Conditional returns come AFTER all hook declarations.
  if (!data) return <DashboardSkeleton />
  return <DashboardClient {...data} />
}
