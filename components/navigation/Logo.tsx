export function Logo({ size = 32, color = 'var(--olive)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="WaveRow">
      <path d="M20 4L36 16v20H26V26a6 6 0 0 0-12 0v10H4V16L20 4z" fill={color} opacity="0.95" />
      <path d="M4 30 Q10 24 16 30 Q22 36 28 30 Q34 24 40 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  )
}
