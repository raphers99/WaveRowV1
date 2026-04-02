'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertTriangle size={26} color="#ef4444" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Something went wrong</h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
          An unexpected error occurred. Try refreshing the page.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={reset}
            style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: '11px 24px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Try again
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.href = '/'}
            style={{ background: 'white', color: 'var(--text-primary)', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '11px 24px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Go home
          </motion.button>
        </div>
      </div>
    </div>
  )
}
