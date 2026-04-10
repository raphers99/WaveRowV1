'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/navigation'

function LoginPageInner() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', zIndex: 100,
    }}>
      {/* Hero */}
      <div style={{
        position: 'relative', flexShrink: 0,
        background: 'linear-gradient(160deg, var(--olive) 0%, var(--olive-dark) 100%)',
        paddingTop: 'calc(52px + env(safe-area-inset-top))', paddingBottom: 28, overflow: 'hidden',
      }}>
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

      {/* Card */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            width: '100%', maxWidth: 400,
            background: 'white', borderRadius: 20,
            border: '1px solid rgba(0,103,71,0.1)',
            padding: '32px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Sign in to WaveRow
            </h2>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Use your @tulane.edu Google account
            </p>
          </div>

          {error === 'not_tulane' && (
            <div style={{
              width: '100%', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#dc2626', margin: 0, textAlign: 'center' }}>
                Only @tulane.edu accounts can access WaveRow.
              </p>
            </div>
          )}

          {error === 'auth' && (
            <div style={{
              width: '100%', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#dc2626', margin: 0, textAlign: 'center' }}>
                Sign in failed. Please try again.
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleLogin}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '13px 20px',
              background: 'white', border: '1.5px solid rgba(0,0,0,0.12)',
              borderRadius: 12, cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15,
              color: '#1a1a1a',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign in with Google
          </motion.button>

          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
            Only @tulane.edu accounts are accepted
          </p>
        </motion.div>
      </div>
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
