'use client'

import { useState, Suspense, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/navigation'
import { fadeUp } from '@/lib/motion'

type Mode = 'pick' | 'landlord' | 'studentEmail' | 'studentCode'
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
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  function reset() {
    setMode('pick')
    setEmail('')
    setPassword('')
    setCode(['', '', '', '', '', ''])
    setFormError('')
    setLoading(false)
    setResendTimer(0)
  }

  async function handleSendCode() {
    if (!email) { setFormError('Please enter your email.'); return }
    if (!email.trim().toLowerCase().endsWith('@tulane.edu')) { setFormError('Only @tulane.edu emails can sign in as a student.'); return }
    setLoading(true); setFormError('')
    const supabase = createClient()
    const { error: e } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { data: { role: 'student' }, shouldCreateUser: true },
    })
    setLoading(false)
    if (e) { setFormError(e.message); return }
    setResendTimer(60)
    setMode('studentCode')
  }

  async function handleVerifyCode() {
    const token = code.join('')
    if (token.length < 6) { setFormError('Enter the full 6-digit code.'); return }
    setLoading(true); setFormError('')
    const supabase = createClient()
    const { data, error: e } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' })
    if (e) { setFormError('Invalid code. Please try again.'); setLoading(false); return }
    if (data.user) {
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('user_id', data.user.id).maybeSingle()
      if (!existing) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          name: email.split('@')[0],
          role: 'student',
          verified: true,
          verification_status: 'verified',
          verification_type: 'student',
        })
      }
    }
    router.replace(next)
  }

  function handleResendCode() {
    if (resendTimer > 0) return
    handleSendCode()
  }

  function handleCodeInput(val: string, i: number) {
    if (!/^\d*$/.test(val)) return
    const nextCode = [...code]
    nextCode[i] = val.slice(-1)
    setCode(nextCode)
    setFormError('')
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

              {(error === 'not_tulane' || error === 'auth' || formError) && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#dc2626', margin: 0, textAlign: 'center' }}>
                    {error === 'not_tulane'
                      ? 'Only @tulane.edu accounts can access WaveRow.'
                      : formError || 'Sign in failed. Please try again.'}
                  </p>
                </div>
              )}

              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>Who are you?</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Student */}
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setMode('studentEmail')}
                  style={{ padding: '20px', borderRadius: 16, border: '2px solid rgba(0,103,71,0.15)', background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 2px' }}>Student</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Sign in with your @tulane.edu email</p>
                  </div>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>→</span>
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

          {/* Student Email Form */}
          {mode === 'studentEmail' && (
            <motion.div key="studentEmail" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -8 }}>
              <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Back</button>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>Student Sign In</h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>Enter your Tulane email address to get started.</p>

              <p className="label-style" style={{ marginBottom: 6 }}>Email</p>
              <input className="input" type="email" value={email}
                onChange={e => { setEmail(e.target.value); setFormError('') }}
                placeholder="you@tulane.edu" autoCapitalize="none" spellCheck={false}
                onKeyDown={e => { if (e.key === 'Enter') handleSendCode() }}
                style={{ marginBottom: 4 }}
              />

              {formError && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#ef4444', marginTop: 10 }}>{formError}</p>}
            </motion.div>
          )}

          {/* Student Code Input */}
          {mode === 'studentCode' && (
            <motion.div key="studentCode" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -8 }}>
              <button onClick={() => { setMode('studentEmail'); setCode(['','','','','','']); setFormError('') }} style={{ background: 'none', border: 'none', color: 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Edit email</button>
              
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 20, background: 'rgba(0,103,71,0.08)', marginBottom: 16 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Check your email</h2>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  <p style={{ margin: '0 0 8px' }}>We sent a verification code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong></p>
                  <div style={{ fontSize: 13, background: 'rgba(0,103,71,0.04)', padding: '10px 14px', borderRadius: 10, margin: '0 auto', maxWidth: 360, textAlign: 'left' }}>
                    <p style={{ margin: '0 0 4px' }}>If you don&apos;t see it within a minute, check your spam or junk folder.</p>
                    <p style={{ margin: 0, opacity: 0.85 }}><strong>Tulane email users:</strong> it may appear in &apos;Other&apos; or filtered inbox tabs.</p>
                  </div>
                </div>
              </div>

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

              {formError && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{formError}</p>}

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || loading}
                  style={{ background: 'none', border: 'none', color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 600, cursor: resendTimer > 0 ? 'default' : 'pointer' }}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                </button>
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

      {/* Sticky action button */}
      {mode !== 'pick' && (
        <div style={{ flexShrink: 0, padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: 'rgba(250,250,248,0.98)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '0.5px solid rgba(0,103,71,0.08)' }}>
          {mode === 'landlord' && (
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleLandlordAuth} disabled={loading || !canSubmit}
              style={{ width: '100%', background: canSubmit ? 'var(--olive)' : 'rgba(0,103,71,0.3)', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
              {loading ? 'Please wait…' : landlordTab === 'signin' ? 'Sign In' : 'Create Account'}
            </motion.button>
          )}
          {mode === 'studentEmail' && (
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSendCode} disabled={loading || !email}
              style={{ width: '100%', background: email ? 'var(--olive)' : 'rgba(0,103,71,0.3)', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, cursor: email ? 'pointer' : 'not-allowed' }}>
              {loading ? 'Sending…' : 'Send Code'}
            </motion.button>
          )}
          {mode === 'studentCode' && (
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleVerifyCode} disabled={loading || code.join('').length < 6}
              style={{ width: '100%', background: code.join('').length === 6 ? 'var(--olive)' : 'rgba(0,103,71,0.3)', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, cursor: code.join('').length === 6 ? 'pointer' : 'not-allowed' }}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </motion.button>
          )}
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
