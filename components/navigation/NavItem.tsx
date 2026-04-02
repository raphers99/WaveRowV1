'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function NavItem({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 12px', position: 'relative' }}>
      <motion.div animate={{ scale: isActive ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
        {icon}
      </motion.div>
      {label && <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--olive)' : '#9ca3af', fontFamily: 'var(--font-dm-sans)' }}>{label}</span>}
    </Link>
  )
}
