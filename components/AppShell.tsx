'use client'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './navigation/Navbar'
import { BottomNav } from './navigation/BottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ minHeight: '100dvh' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      {pathname !== '/login' && pathname !== '/listings/new' && <BottomNav />}
    </>
  )
}
