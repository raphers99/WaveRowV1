import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import AppShell from '@/components/AppShell'
import './globals.css'

const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'], display: 'swap', weight: ['400','700','800'] })
const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], display: 'swap', weight: ['400','500','600','700'] })

export const metadata: Metadata = {
  title: 'WaveRow — Student Housing',
  description: 'Verified apartments, sublets, and roommates for students.',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon',
  },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1,
  userScalable: false, viewportFit: 'cover',
  themeColor: '#006747',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} data-scroll-behavior="smooth">
      <body style={{ backgroundColor: 'var(--surface)', minHeight: '100dvh' }}>
        <AppShell>{children}</AppShell>
        <SpeedInsights />
      </body>
    </html>
  )
}
