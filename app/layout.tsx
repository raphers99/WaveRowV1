import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import AppShell from '@/components/AppShell'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'

import { ToastProvider } from '@/components/ui/Toast'
import HelpBot from '@/components/HelpBot/HelpBot'
import { NativeBridge } from '@/components/NativeBridge'
import HandwrittenSplash from '@/components/HandwrittenSplash'
import './globals.css'

const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'], display: 'swap', weight: ['400','700','800'] })
const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], display: 'swap', weight: ['400','500','600','700'] })

export const metadata: Metadata = {
  title: 'WaveRow | Tulane Student Housing, Sublets & Roommates in New Orleans',
  description: 'WaveRow is a student housing marketplace for Tulane University — find sublets, semester leases, and roommates in New Orleans.',
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'WaveRow',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'WaveRow — Student Housing',
    description: 'Bridging the gap between students and landlords.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'WaveRow — Student Housing' }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#006747',
  // Allow pinch-to-zoom for accessibility
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} data-scroll-behavior="smooth">
      <body style={{ backgroundColor: 'var(--surface)', minHeight: '100dvh' }}>
        <HandwrittenSplash />
        <NativeBridge />
        <AnalyticsProvider />
        <ToastProvider />
        <HelpBot />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
