'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Logo } from './Logo'
import { useScrollTrigger } from '@/hooks/useScrollTrigger'

export function Navbar() {
  const scrolled = useScrollTrigger(80)
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      paddingTop: 'env(safe-area-inset-top)',
      height: 'calc(56px + env(safe-area-inset-top))',
      background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,103,71,0.08)' : 'none',
      transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size={28} color={isHome && !scrolled ? 'white' : 'var(--olive)'} />
        </Link>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700,
            color: isHome && !scrolled ? 'white' : 'var(--text-primary)',
            transition: 'color 0.3s ease',
          }}>WaveRow</span>
        </Link>
        <Link href="/dashboard">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ width: 36, height: 36, borderRadius: '50%', background: scrolled || !isHome ? 'rgba(0,103,71,0.08)' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color={isHome && !scrolled ? 'white' : 'var(--olive)'} />
          </motion.div>
        </Link>
      </div>
    </header>
  )
}
