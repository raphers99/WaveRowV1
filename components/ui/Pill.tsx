'use client'
import type { PillProps } from '@/types'

export function Pill({ label, active, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
        border: active ? 'none' : '1px solid rgba(0,103,71,0.15)',
        background: active ? 'var(--olive)' : 'transparent',
        color: active ? 'white' : 'var(--text-secondary)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'transform 0.15s ease, background 0.2s ease, color 0.2s ease',
      }}
      className="pill-tap"
    >
      {label}
    </button>
  )
}
