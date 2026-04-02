'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { Logo } from '@/components/navigation'
import { fadeUp } from '@/lib/motion'

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<'student' | 'subletter' | 'landlord' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!role) { setError('Please select your role.'); return }
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && (role === 'student' || role === 'subletter') && !email.endsWith('@tulane.edu')) {
      setError('Please use your university email to sign up as a student.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = getSupabase()

    if (mode === 'login') {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      if (e) { setError(e.message); setLoading(false); return }
      router.replace('/listings')
    } else {
      const { data, error: e } = await supabase.auth.signUp({ email, password })
      if (e) { setError(e.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          name: email.split('@')[0],
          role,
          verified: role === 'student' || role === 'subletter',
          verification_status: role === 'landlord' ? 'unverified' : 'verified',
          verification_type: role,
        })
        router.replace('/listings')
      }
    }
    setLoading(false)
  }

  const ROLES: Array<{ key: 'student' | 'subletter' | 'landlord'; title: string; desc: string }> = [
    { key: 'student', title: 'Student', desc: 'Find housing near campus' },
    { key: 'subletter', title: 'Subletter', desc: 'List your place for a semester' },
    { key: 'landlord', title: 'Landlord', desc: 'List and manage your properties' },
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg, var(--olive) 0%, var(--olive-dark) 100%)', paddingTop: 'calc(72px + env(safe-area-inset-top))', paddingBottom: 48, overflow: 'hidden' }}>
        <div className="hero-grid" style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
          <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lgrid)" />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
        >
          <Logo size={48} color="white" />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'white', margin: '12px 0 4px' }}>WaveRow</h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Student Housing Marketplace</p>
        </motion.div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, background: 'var(--surface)', padding: '24px 16px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,103,71,0.06)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: mode === m ? 'white' : 'transparent', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <p className="label-style" style={{ marginBottom: 10 }}>I am a</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {ROLES.map(r => (
              <motion.button
                key={r.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setRole(r.key); setError('') }}
                style={{
                  padding: '14px 16px', borderRadius: 14, border: `2px solid ${role === r.key ? 'var(--olive)' : 'rgba(0,103,71,0.12)'}`,
                  background: role === r.key ? 'rgba(0,103,71,0.05)' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', opacity: role && role !== r.key ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 2px' }}>{r.title}</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{r.desc}</p>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${role === r.key ? 'var(--olive)' : 'rgba(0,103,71,0.2)'}`, background: role === r.key ? 'var(--olive)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {role === r.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Email + password */}
          <AnimatePresence>
            {role && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  <div>
                    <p className="label-style" style={{ marginBottom: 6 }}>Email</p>
                    <input
                      className="input"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder={role === 'student' ? 'you@tulane.edu' : 'you@email.com'}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <p className="label-style" style={{ marginBottom: 6 }}>Password</p>
                    <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="Password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</p>
          )}
        </motion.div>
      </div>

      {/* Sticky submit */}
      <div style={{ padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: 'rgba(242,242,247,0.95)', backdropFilter: 'blur(12px)', borderTop: '0.5px solid rgba(0,103,71,0.08)' }}>
        <motion.button
          whileHover={{ scale: role && email && password ? 1.01 : 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || !role || !email || !password}
          style={{
            width: '100%', background: role && email && password ? 'var(--olive)' : 'rgba(0,103,71,0.3)',
            color: 'white', border: 'none', borderRadius: 14, padding: '14px',
            fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16,
            cursor: role && email && password ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </motion.button>
      </div>
    </div>
  )
}
