'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, MessageCircle } from 'lucide-react'
import Image from 'next/image'

export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  // Reset scroll state on every navigation, then re-attach listener
  useEffect(() => {
    setScrolled(window.scrollY > 80)
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      paddingTop: 'env(safe-area-inset-top)',
      height: 'calc(56px + env(safe-area-inset-top))',
      background: isHome && !scrolled ? 'transparent' : 'rgba(255,255,255,0.95)',
      backdropFilter: isHome && !scrolled ? 'none' : 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: isHome && !scrolled ? 'none' : 'blur(20px) saturate(180%)',
      borderBottom: isHome && !scrolled ? 'none' : '1px solid rgba(0,103,71,0.08)',
      transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Image
            src="/icon.png"
            alt="WaveRow"
            width={32}
            height={32}
            style={{ borderRadius: 8, display: 'block' }}
            priority
          />
        </Link>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700,
            color: isHome && !scrolled ? 'white' : 'var(--text-primary)',
            transition: 'color 0.3s ease',
          }}>WaveRow</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/messages">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: scrolled || !isHome ? 'rgba(0,103,71,0.08)' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={18} color={isHome && !scrolled ? 'white' : 'var(--olive)'} />
            </motion.div>
          </Link>
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: scrolled || !isHome ? 'rgba(0,103,71,0.08)' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color={isHome && !scrolled ? 'white' : 'var(--olive)'} />
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  )
}
