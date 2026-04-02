'use client'
import type { InputProps } from '@/types'

export function Input({ value, onChange, placeholder }: InputProps) {
  return (
    <input
      className="input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}
