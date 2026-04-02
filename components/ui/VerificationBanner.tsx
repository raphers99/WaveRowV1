'use client'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'

export function VerificationBanner({ status, onGetVerified }: { status: string; onGetVerified: () => void }) {
  if (status === 'verified') return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: status === 'pending' ? 'rgba(200,168,75,0.1)' : 'rgba(0,103,71,0.06)',
        border: `1px solid ${status === 'pending' ? 'rgba(200,168,75,0.3)' : 'rgba(0,103,71,0.15)'}`,
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert size={18} color={status === 'pending' ? 'var(--gold)' : 'var(--olive)'} />
        <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-primary)' }}>
          {status === 'pending' ? 'Verification in review' : 'Verify your account to list properties'}
        </span>
      </div>
      {status === 'unverified' && (
        <button
          onClick={onGetVerified}
          style={{
            background: 'var(--olive)', color: 'white', border: 'none',
            borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Get Verified
        </button>
      )}
    </motion.div>
  )
}
