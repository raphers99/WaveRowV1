'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

export function MessageInput({ onSend, disabled }: { onSend: (body: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: 'white', borderTop: '1px solid rgba(0,103,71,0.08)' }}>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        style={{
          flex: 1, background: 'rgba(0,103,71,0.05)', border: '1px solid rgba(0,103,71,0.1)',
          borderRadius: 20, padding: '10px 16px', fontSize: 15,
          fontFamily: 'var(--font-dm-sans)', outline: 'none', color: 'var(--text-primary)', WebkitTextFillColor: 'var(--text-primary)',
        }}
      />
      <motion.button
        type="submit"
        whileTap={{ scale: 0.9 }}
        disabled={!value.trim() || disabled}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: value.trim() ? 'var(--olive)' : 'rgba(0,103,71,0.1)',
          border: 'none', cursor: value.trim() ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s ease',
        }}
        aria-label="Send message"
      >
        <Send size={18} color={value.trim() ? 'white' : 'var(--text-muted)'} />
      </motion.button>
    </form>
  )
}
