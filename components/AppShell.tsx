'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar } from './navigation/Navbar'
import { BottomNav } from './navigation/BottomNav'
import { usePageTracking } from '@/hooks/usePageTracking'

function hideChromeForPath(pathname: string) {
  const login = pathname === '/login' || pathname === '/login/'
  const newListing = pathname === '/listings/new' || pathname === '/listings/new/'
  return login || newListing
}

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
            { label: 'Listings', href: '/' },
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
          WaveRow is not a licensed real estate broker. Listings are provided by users and have not been independently verified. WaveRow does not own, manage, or guarantee any listed properties. All transactions are made directly between users. WaveRow is not responsible for the outcome of any housing arrangement.
        </p>

        {/* Copyright */}
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          © {new Date().getFullYear()} WaveRow. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  usePageTracking()
  const hideChrome = hideChromeForPath(pathname)
  return (
    <>
      <Navbar />
      {/* Plain wrapper: AnimatePresence + motion here caused hard crashes on static/Vercel builds (React 19 + framer-motion route transitions). */}
      <div style={{ minHeight: '100dvh' }}>
        {children}
        {!hideChrome && <GlobalFooter />}
      </div>
      {!hideChrome && <BottomNav />}
    </>
  )
}
