'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginPageInner() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  
  const [loading, setLoading] = useState(false)

  const handleMicrosoftLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile openid',
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-[rgba(0,103,71,0.12)] bg-white shadow-xl w-full max-w-sm mx-4">
        
        {/* Replaced generic icon with the WaveRow SVG path or text if unavailable */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[rgba(0,103,71,0.08)] text-[var(--olive)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold font-[var(--font-playfair)] text-[var(--text-primary)]">Sign in to WaveRow</h1>
          <p className="text-sm text-[var(--text-muted)] font-[var(--font-dm-sans)] mt-2">Use your @tulane.edu Microsoft account</p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="flex items-center gap-3 w-full justify-center px-4 py-3.5 rounded-xl bg-[#2F2F2F] hover:bg-[#1f1f1f] disabled:opacity-70 transition text-sm font-medium text-white shadow-sm"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            {/* Microsoft logo SVG inline */}
            <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            {loading ? 'Redirecting...' : 'Sign in with Microsoft'}
          </button>
          
          {error === 'not_tulane' && (
            <p className="text-sm font-medium text-red-500 text-center font-[var(--font-dm-sans)] bg-red-50 p-3 rounded-lg border border-red-100">
              Only @tulane.edu accounts can access WaveRow.
            </p>
          )}

          <p className="text-xs text-[var(--text-muted)] text-center font-[var(--font-dm-sans)] px-2">
            Only verified @tulane.edu accounts are accepted into the student-only ecosystem.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--surface)]" />}>
      <LoginPageInner />
    </Suspense>
  )
}
