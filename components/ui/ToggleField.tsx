'use client'
import { motion } from 'framer-motion'

export function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)' }}>{label}</span>
      <motion.button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 26, borderRadius: 13, padding: 3,
          background: value ? 'var(--olive)' : '#e5e7eb',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          justifyContent: value ? 'flex-end' : 'flex-start',
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={label}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
        />
      </motion.button>
    </div>
  )
}
