'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './navigation/Navbar'
import { BottomNav } from './navigation/BottomNav'
import { usePageTracking } from '@/hooks/usePageTracking'

const HIDE_CHROME = ['/login', '/listings/new']

function GlobalFooter() {
  return (
    <footer style={{
      background: '#1a1a1a',
      color: 'white',
      padding: '48px 24px 32px',
      paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Brand */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: 'white' }}>
            WaveRow
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Bridging the gap between students and landlords.
          </p>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginBottom: 32 }}>
          {[
            { label: 'About', href: '/' },
            { label: 'Listings', href: '/listings' },
            { label: 'Messages', href: '/messages' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Disclosure */}
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: '0 0 20px' }}>
          WaveRow is a student housing marketplace that connects students with landlords and subletters. WaveRow does not own, manage, or guarantee any listed properties, and is not a licensed real estate broker or agent. All transactions are between the parties directly. WaveRow makes no representations about the accuracy of listings and is not responsible for the outcome of any housing arrangement.
        </p>

        {/* Copyright */}
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          © 2025 WaveRow. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  usePageTracking()
  const hideChrome = HIDE_CHROME.includes(pathname)
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ minHeight: '100dvh' }}
        >
          {children}
          {!hideChrome && <GlobalFooter />}
        </motion.div>
      </AnimatePresence>
      {!hideChrome && <BottomNav />}
    </>
  )
}
