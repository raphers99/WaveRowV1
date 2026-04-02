'use client'
import { useState } from 'react'
import type { ListingImageProps } from '@/types'

export function ListingImage({ src, alt }: ListingImageProps) {
  const [error, setError] = useState(false)
  if (error || !src) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--olive-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><path d="M9 21V12h6v9" />
        </svg>
      </div>
    )
  }
  return <img src={src} alt={alt} onError={() => setError(true)} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
}
