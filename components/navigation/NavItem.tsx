'use client'
import Link from 'next/link'

export function NavItem({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', outline: 'none', WebkitTapHighlightColor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 12px', position: 'relative' }}>
      <div style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s ease' }}>{icon}</div>
      {label && <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--olive)' : '#9ca3af', fontFamily: 'var(--font-dm-sans)' }}>{label}</span>}
    </Link>
  )
}
