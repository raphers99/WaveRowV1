'use client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'

export function SwipeEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 24px', textAlign: 'center' }}>
      <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="1.5" opacity={0.4}>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><path d="M9 21V12h6v9" />
        </svg>
      </motion.div>
      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 8px' }}>You have seen everything</h3>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', marginBottom: 28 }}>Check back soon for new listings.</p>
      <Button label="Start Over" onClick={onReset} variant="primary" />
    </div>
  )
}
