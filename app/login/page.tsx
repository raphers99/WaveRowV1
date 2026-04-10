'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/navigation'
import { fadeUp } from '@/lib/motion'

type Mode = 'pick' | 'landlord'
type LandlordTab = 'signin' | 'signup'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  const [mode, setMode] = useState<Mode>('pick')
  const [landlordTab, setLandlordTab] = useState<LandlordTab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  function reset() {
    setMode('pick')
    setEmail('')
    setPassword('')
    setFormError('')
    setLoading(false)
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  async function handleLandlordAuth() {
    if (!email) { setFormError('Please enter your email.'); return }
    if (!password) { setFormError('Please enter your password.'); return }
    setLoading(true); setFormError('')
    const supabase = createClient()

    if (landlordTab === 'signin') {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (e) { setFormError(e.message); return }
      router.replace(next)
    } else {
      const { data, error: e } = await supabase.auth.signUp({
        email, password,
        options: { data: { role: 'landlord' } },
      })
      setLoading(false)
      if (e) { setFormError(e.message); return }
      if (data.user) {
        const { data: existing } = await supabase
          .from('profiles').select('id').eq('user_id', data.user.id).maybeSingle()
        if (!existing) {
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            name: email.split('@')[0],
            role: 'landlord',
            verified: false,
            verification_status: 'unverified',
            verification_type: 'landlord',
          })
        }
      }
      router.replace(next)
    }
  }

  const canSubmit = !!email && !!password

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', zIndex: 100 }}>

      {/* Hero */}
      <div style={{ position: 'relative', flexShrink: 0, background: 'linear-gradient(160deg, var(--olive) 0%, var(--olive-dark) 100%)', paddingTop: 'calc(52px + env(safe-area-inset-top))', paddingBottom: 28, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
          <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="lgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#lgrid)" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Logo size={48} color="white" />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'white', margin: '12px 0 4px' }}>WaveRow</h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Student Housing Marketplace</p>
        </motion.div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 16px 16px', maxWidth: 480, width: '100%', alignSelf: 'center', boxSizing: 'border-box' }}>
        <AnimatePresence mode="wait">

          {/* Mode picker */}
          {mode === 'pick' && (
            <motion.div key="pick" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -8 }}>

              {(error === 'not_tulane' || error === 'auth') && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#dc2626', margin: 0, textAlign: 'center' }}>
                    {error === 'not_tulane' ? 'Only @tulane.edu accounts can access WaveRow.' : 'Sign in failed. Please try again.'}
                  </p>
                </div>
              )}

              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>Who are you?</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Student — Google */}
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleGoogleSignIn}
                  style={{ padding: '20px', borderRadius: 16, border: '2px solid rgba(0,103,71,0.15)', background: 'white', cursor: 'pointer', textAlign: 'left' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 4px' }}>Student</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px' }}>Sign in with your @tulane.edu Google account</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 16px', background: 'white', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>Continue with Google</span>
                  </div>
                </motion.button>

                {/* Landlord */}
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setMode('landlord')}
                  style={{ padding: '20px', borderRadius: 16, border: '2px solid rgba(0,103,71,0.15)', background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 2px' }}>Landlord</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Sign in or create a landlord account</p>
                  </div>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>→</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Landlord form */}
          {mode === 'landlord' && (
            <motion.div key="landlord" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -8 }}>
              <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Back</button>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Landlord sign in</h2>

              <div style={{ display: 'flex', background: 'rgba(0,103,71,0.06)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
                {(['signin', 'signup'] as const).map(tab => (
                  <button key={tab} onClick={() => { setLandlordTab(tab); setFormError('') }}
                    style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', background: landlordTab === tab ? 'white' : 'transparent', fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: landlordTab === tab ? 600 : 400, color: landlordTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: landlordTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                    {tab === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              <p className="label-style" style={{ marginBottom: 6 }}>Email</p>
              <input className="input" type="text" inputMode="email" value={email}
                onChange={e => { setEmail(e.target.value); setFormError('') }}
                placeholder="you@email.com" autoCapitalize="none" spellCheck={false}
                onKeyDown={e => { if (e.key === 'Enter') handleLandlordAuth() }}
                style={{ marginBottom: 12 }}
              />

              <p className="label-style" style={{ marginBottom: 6 }}>Password</p>
              <input className="input" type="password" value={password}
                onChange={e => { setPassword(e.target.value); setFormError('') }}
                placeholder="••••••••"
                autoComplete={landlordTab === 'signin' ? 'current-password' : 'new-password'}
                onKeyDown={e => { if (e.key === 'Enter') handleLandlordAuth() }}
              />

              {formError && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#ef4444', marginTop: 10 }}>{formError}</p>}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Landlord submit button */}
      {mode === 'landlord' && (
        <div style={{ flexShrink: 0, padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: 'rgba(250,250,248,0.98)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '0.5px solid rgba(0,103,71,0.08)' }}>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleLandlordAuth} disabled={loading || !canSubmit}
            style={{ width: '100%', background: canSubmit ? 'var(--olive)' : 'rgba(0,103,71,0.3)', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
            {loading ? 'Please wait…' : landlordTab === 'signin' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--surface)' }} />}>
      <LoginPageInner />
    </Suspense>
  )
}
