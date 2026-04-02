'use client'
import { AnimatePresence, motion } from 'framer-motion'
import type { UndoToastProps } from '@/types'

export function UndoToast({ visible, onUndo }: UndoToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: '#1f2937', color: 'white', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, zIndex: 60, fontSize: 14, fontFamily: 'var(--font-dm-sans)' }}
        >
          <span>Listing skipped</span>
          <button onClick={onUndo} style={{ color: 'var(--sky)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Undo</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
