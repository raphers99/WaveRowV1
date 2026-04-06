'use client'
import { Heart } from 'lucide-react'
import type { SaveButtonProps } from '@/types'

export function SaveButton({ isSaved, onToggle }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s ease',
      }}
      aria-label={isSaved ? 'Unsave listing' : 'Save listing'}
    >
      <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} stroke={isSaved ? '#ef4444' : 'var(--text-muted)'} strokeWidth={2} />
    </button>
  )
}
