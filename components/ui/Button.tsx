'use client'
import type { ButtonProps } from '@/types'

export function Button({ label, onClick, variant, disabled }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn-${variant} ui-btn-tap`}
      onClick={onClick}
      disabled={disabled}
      style={{ transition: 'transform 0.15s ease, opacity 0.15s ease' }}
    >
      {label}
    </button>
  )
}
