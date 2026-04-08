'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/navigation'
import { fadeUp } from '@/lib/motion'

function getSupabase() {
  return createClient()
}

const ROLES: Array<{ key: 'student' | 'subletter' | 'landlord'; title: string; desc: string }> = [
  { key: 'student', title: 'Student', desc: 'Find housing near campus' },
  { key: 'subletter', title: 'Subletter', desc: 'List your place for a semester' },
  { key: 'landlord', title: 'Landlord', desc: 'List and manage your properties' },
]

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/listings'
  const [role, setRole] = useState<'student' | 'subletter' | 'landlord' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [landlordTab, setLandlordTab] = useState<'signin' | 'signup'>('signin')
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const emailRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)

  const isOtp = role === 'student' || role === 'subletter'

  // Scroll focused input into view above keyboard
  function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 320)
  }

  // --- OTP flow (student / subletter) ---
  async function handleSendCode() {
    if (!role) { setError('Please select your role.'); return }
    if (!email) { setError('Please enter your email.'); return }
    if (!email.endsWith('@tulane.edu')) { setError('Please use your Tulane email.'); return }
    setLoading(true); setError('')
    const { error: e } = await getSupabase().auth.signInWithOtp({
      email,
      options: { data: { role }, shouldCreateUser: true },
    })
    setLoading(false)
    if (e) { setError(e.message); return }
    setStep('code')
  }

  async function handleVerifyCode() {
    const token = code.join('')
    if (token.length < 6) { setError('Enter the full 6-digit code.'); return }
    setLoading(true); setError('')
    const supabase = getSupabase()
    const { data, error: e } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (e) { setError('Invalid code. Please try again.'); setLoading(false); return }
    if (data.user) {
      // Check if the user already has a profile to avoid overwriting their name
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (existing) {
        // Returning user — update verification fields only (preserve name)
        await supabase.from('profiles').update({
          role,
          verified: true,
          verification_status: 'verified',
          verification_type: role,
        }).eq('user_id', data.user.id)
      } else {
        // New user — create profile with email-derived name
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          name: email.split('@')[0],
          role,
          verified: true,
          verification_status: 'verified',
          verification_type: role,
        })
      }
    }
    router.replace(nextPath)
  }

  // --- Password flow (landlord) ---
  async function handleLandlordAuth() {
    if (!email) { setError('Please enter your email.'); return }
    if (!password) { setError('Please enter your password.'); return }
    setLoading(true); setError('')
    const supabase = getSupabase()
    if (landlordTab === 'signin') {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (e) { setError(e.message); return }
      router.replace(nextPath)
    } else {
      const { data, error: e } = await supabase.auth.signUp({ email, password, options: { data: { role: 'landlord' } } })
      setLoading(false)
      if (e) { setError(e.message); return }
      if (data.user) {
        // Check if the user already has a profile to avoid overwriting their name
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle()
        if (!existing) {
          // New user — create profile with email-derived name
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
      router.replace(nextPath)
    }
  }

  function handleCodeInput(val: string, i: number) {
    if (!/^\d*$/.test(val)) return
    const next = [...code]
    next[i] = val.slice(-1)
    setCode(next)
    setError('')
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
    if (!val && i > 0) inputRefs.current[i - 1]?.focus()
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  function handleSubmit() {
    if (step === 'code') { handleVerifyCode(); return }
    if (role === 'landlord') { handleLandlordAuth(); return }
    handleSendCode()
  }

  const canSubmit = (() => {
    if (step === 'code') return code.join('').length === 6
    if (!role || !email) return false
    if (role === 'landlord') return !!password
    return true
  })()

  const buttonLabel = loading
    ? 'Please wait...'
    : step === 'code'
    ? 'Verify Code'
    : role === 'landlord'
    ? (landlordTab === 'signin' ? 'Sign In' : 'Create Account')
    : 'Send Code'

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', zIndex: 100 }}>
      {/* Hero */}
      <div style={{ position: 'relative', flexShrink: 0, background: 'linear-gradient(160deg, var(--olive) 0%, var(--olive-dark) 100%)', paddingTop: 'calc(52px + env(safe-area-inset-top))', paddingBottom: 28, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
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

      {/* Form — scrollable, takes all remaining space between hero and button */}
      <div ref={formRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--surface)', padding: '20px 16px 16px', width: '100%', boxSizing: 'border-box', maxWidth: 480, alignSelf: 'center' }}>
        <AnimatePresence mode="wait">

          {step === 'code' ? (
            <motion.div key="code" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -8 }} style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Check your email</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }} onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeInput(e.target.value, i)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) inputRefs.current[i - 1]?.focus() }}
                    autoFocus={i === 0}
                    style={{ width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700, border: `2px solid ${digit ? 'var(--olive)' : 'rgba(0,103,71,0.15)'}`, borderRadius: 12, outline: 'none', background: 'white', fontFamily: 'var(--font-dm-sans)', color: 'var(--text-primary)', transition: 'border-color 0.15s' }}
                  />
                ))}
              </div>
              {error && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</p>}
              <button
                onClick={() => { setStep('form'); setCode(['','','','','','']); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Use a different email
              </button>
            </motion.div>

          ) : (
            <motion.div key="form" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -8 }}>
              {/* Role selector */}
              <p className="label-style" style={{ marginBottom: 10 }}>I am a</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {ROLES.map(r => (
                  <motion.button
                    key={r.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setRole(r.key); setError('') }}
                    style={{
                      padding: '14px 16px', borderRadius: 14,
                      border: `2px solid ${role === r.key ? 'var(--olive)' : 'rgba(0,103,71,0.12)'}`,
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

              <AnimatePresence>
                {role && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>

                    {/* Landlord: sign in / sign up tabs */}
                    {role === 'landlord' && (
                      <div style={{ display: 'flex', background: 'rgba(0,103,71,0.06)', borderRadius: 12, padding: 4, marginBottom: 16 }}>
                        {(['signin', 'signup'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => { setLandlordTab(tab); setError('') }}
                            style={{
                              flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                              background: landlordTab === tab ? 'white' : 'transparent',
                              fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: landlordTab === tab ? 600 : 400,
                              color: landlordTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                              boxShadow: landlordTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                              transition: 'all 0.15s',
                            }}
                          >
                            {tab === 'signin' ? 'Sign In' : 'Create Account'}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="label-style" style={{ marginBottom: 6 }}>Email</p>
                    <input
                      ref={emailRef}
                      className="input"
                      type="text"
                      inputMode="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder={role === 'landlord' ? 'you@email.com' : 'you@tulane.edu'}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      onFocus={handleInputFocus}
                      onKeyDown={e => { if (e.key === 'Enter') { if (role === 'landlord') passwordRef.current?.focus(); else handleSubmit() } }}
                      style={{ marginBottom: role === 'landlord' ? 12 : 4 }}
                    />

                    {role === 'landlord' && (
                      <>
                        <p className="label-style" style={{ marginBottom: 6 }}>Password</p>
                        <input
                          ref={passwordRef}
                          className="input"
                          type="password"
                          value={password}
                          onChange={e => { setPassword(e.target.value); setError('') }}
                          placeholder="••••••••"
                          autoComplete={landlordTab === 'signin' ? 'current-password' : 'new-password'}
                          onFocus={handleInputFocus}
                          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                          style={{ marginBottom: 4 }}
                        />
                      </>
                    )}

                    {role !== 'landlord' && (
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        A 6-digit code will be sent to your Tulane email
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#ef4444', marginTop: 10 }}>{error}</p>}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Submit button — flexShrink:0 keeps it pinned at the bottom of our fixed container */}
      <div style={{ flexShrink: 0, padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: 'rgba(250,250,248,0.98)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '0.5px solid rgba(0,103,71,0.08)' }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          style={{
            width: '100%',
            background: canSubmit ? 'var(--olive)' : 'rgba(0,103,71,0.3)',
            color: 'white', border: 'none', borderRadius: 14, padding: '14px',
            fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {buttonLabel}
        </motion.button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
