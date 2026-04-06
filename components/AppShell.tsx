'use client'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './navigation/Navbar'
import { BottomNav } from './navigation/BottomNav'
import { usePageTracking } from '@/hooks/usePageTracking'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  usePageTracking()
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
        </motion.div>
      </AnimatePresence>
      {pathname !== '/login' && pathname !== '/listings/new' && <BottomNav />}
    </>
  )
}
