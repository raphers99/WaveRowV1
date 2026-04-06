'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type ToastState = { id: number; message: string; type: ToastType }

let toastId = 0
const listeners = new Set<(toasts: ToastState[]) => void>()
let toasts: ToastState[] = []

export const toast = {
  show(message: string, type: ToastType = 'info') {
    const id = toastId++
    toasts = [...toasts, { id, message, type }]
    listeners.forEach(l => l(toasts))
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      listeners.forEach(l => l(toasts))
    }, 3000)
  },
  subscribe(listener: (toasts: ToastState[]) => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }
}

export function ToastProvider() {
  const [toastState, setToastState] = useState<ToastState[]>([])
  useEffect(() => toast.subscribe(setToastState), [])

  return (
    <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <AnimatePresence>
        {toastState.map(({ id, message, type }) => (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            style={{
              padding: '10px 16px',
              borderRadius: 99,
              color: 'white',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: type === 'error' ? '#ef4444' : 'var(--olive)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
