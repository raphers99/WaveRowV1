import { ShieldCheck } from 'lucide-react'

export function VerifiedBadge({ type }: { type: 'student' | 'landlord' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(0,103,71,0.08)', color: 'var(--olive)',
      fontSize: 11, fontWeight: 600, padding: '3px 8px',
      borderRadius: 99, fontFamily: 'var(--font-dm-sans)',
    }}>
      <ShieldCheck size={11} />
      {type === 'student' ? 'Verified Student' : 'Verified Owner'}
    </span>
  )
}
