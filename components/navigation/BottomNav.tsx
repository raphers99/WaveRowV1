'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, Plus, Users, User, MapPin, MessageCircle } from 'lucide-react'
import { NavItem } from './NavItem'

const TABS = [
  { href: '/', icon: Home, label: 'Home', isPlus: false },
  { href: '/map', icon: MapPin, label: 'Map', isPlus: false },
  { href: '/listings/new', icon: Plus, label: '', isPlus: true },
  { href: '/roommates', icon: Users, label: 'Roommates', isPlus: false },
  { href: '/messages', icon: MessageCircle, label: 'Messages', isPlus: false },
]

async function triggerHaptic() {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // no-op on web
  }
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '0.5px solid rgba(0,103,71,0.1)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ maxWidth: 500, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', height: 64, alignItems: 'center' }}>
        {TABS.map(tab => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const Icon = tab.icon

          if (tab.isPlus) {
            return (
              <div key={tab.href} style={{ display: 'flex', justifyContent: 'center' }}>
                <Link href={tab.href} onClick={triggerHaptic} style={{ textDecoration: 'none', outline: 'none', WebkitTapHighlightColor: 'transparent' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'linear-gradient(145deg, var(--olive), var(--olive-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,103,71,0.35)',
                    position: 'relative', top: -2
                  }}>
                    <Icon size={26} color="white" strokeWidth={2.5} />
                  </div>
                </Link>
              </div>
            )
          }

          return (
            <div key={tab.href} onClick={triggerHaptic} style={{ display: 'flex', justifyContent: 'center' }}>
              <NavItem
                href={tab.href}
                icon={<Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? 'var(--olive)' : '#9ca3af'} />}
                label={tab.label}
                isActive={isActive}
              />
            </div>
          )
        })}
      </div>
    </nav>
  )
}
