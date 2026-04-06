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
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session) { router.replace('/login'); return }
      const { data: profile } = await getSupabase().from('profiles').select('*').eq('user_id', session.user.id).single()
      identifyUser(session.user.id, { role: (profile as Profile | null)?.role ?? 'student', email: session.user.email ?? '' })
      setData({ profile: profile as Profile | null, userId: session.user.id, email: session.user.email ?? '' })
    })()
  }, [router])

  if (!data) return <div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />

  return <DashboardClient {...data} />
}
