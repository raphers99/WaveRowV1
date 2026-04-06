'use client'

import { useEffect, useState } from 'react'
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
  const [data, setData] = useState<{ profile: Profile | null; userId: string; email: string } | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: { session }, error: sessionError } = await getSupabase().auth.getSession()
        if (sessionError) throw sessionError
        if (!session) { router.replace('/login'); return }

        let profile: Profile | null = null
        try {
          const { data: profileData } = await getSupabase()
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          profile = profileData as Profile | null
        } catch (profileErr) {
          // Profile fetch failed — still show dashboard with null profile
          console.error('[Dashboard] profile fetch failed:', profileErr)
        }

        identifyUser(session.user.id, {
          role: profile?.role ?? 'student',
          email: session.user.email ?? '',
        })
        setData({ profile, userId: session.user.id, email: session.user.email ?? '' })
      } catch (err) {
        console.error('[Dashboard] auth error:', err)
        router.replace('/login')
      }
    })()
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
