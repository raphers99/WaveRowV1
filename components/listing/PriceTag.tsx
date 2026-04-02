import type { PriceTagProps } from '@/types'

export function PriceTag({ price }: PriceTagProps) {
  return (
    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 19, color: 'var(--text-primary)' }}>
      ${price.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
    </span>
  )
}
