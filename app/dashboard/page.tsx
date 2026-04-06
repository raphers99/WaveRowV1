'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { DashboardClient } from './DashboardClient'
import { identifyUser } from '@/lib/analytics'
import type { Profile } from '@/types'

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export default function DashboardPage() {
  const router = useRouter()
  // mounted guard — prevents setState after unmount (avoids insertBefore/removeChild
  // errors when framer-motion exits the page while an async fetch is still in flight)
  const mountedRef = useRef(true)
  const [data, setData] = useState<{ profile: Profile | null; userId: string; email: string } | null>(null)

  useEffect(() => {
    mountedRef.current = true
    ;(async () => {
      try {
        const { data: { session }, error: sessionError } = await getSupabase().auth.getSession()
        if (!mountedRef.current) return
        if (sessionError) throw sessionError
        if (!session) { router.replace('/login'); return }

        const supabase = getSupabase()
        // maybeSingle() returns null (not 406) when the profile row doesn't exist yet
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (!mountedRef.current) return

        let profile = profileData as Profile | null

        // Issue 3: no profile row — create one so the dashboard is never blank.
        // This is a safety-net for users who signed up before the DB trigger was
        // applied. The trigger (handle_new_user) should handle new sign-ups going
        // forward; see scripts/fix-profiles.sql to apply it and backfill.
        if (!profile) {
          const { data: created } = await supabase
            .from('profiles')
            .upsert({
              user_id: session.user.id,
              name: session.user.email?.split('@')[0] ?? 'User',
              role: (session.user.user_metadata?.role as string | undefined) ?? 'student',
              verified: false,
              verification_status: 'unverified',
              verification_type: session.user.user_metadata?.role ?? 'student',
            }, { onConflict: 'user_id' })
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

  if (!data) {
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

  return <DashboardClient {...data} />
}
