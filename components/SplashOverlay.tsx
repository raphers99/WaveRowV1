'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

async function hideNativeSplash() {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 0 })
  } catch { /* no-op on web */ }
}

export function SplashOverlay() {
  // Must initialize false — SSR cannot access sessionStorage, so a lazy
  // initializer that returns true on cold-start causes a hydration mismatch
  // which React suppresses (keeping false). Fix: always false, set in useEffect.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const initialLoader = document.getElementById('initial-loader')
    const isColdStart = !sessionStorage.getItem('splash_shown')

    hideNativeSplash()

    if (isColdStart) {
      // Show the React-managed animated overlay, then hand off by removing
      // the static pre-hydration div on the next frame (once overlay is painted).
      setVisible(true)
      requestAnimationFrame(() => initialLoader?.remove())
      const timer = setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem('splash_shown', '1')
      }, 2200)
      return () => clearTimeout(timer)
    } else {
      // Warm start: just fade out and remove the static loader quickly.
      if (initialLoader) {
        initialLoader.style.transition = 'opacity 0.25s ease'
        initialLoader.style.opacity = '0'
        setTimeout(() => initialLoader.remove(), 250)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            // Hardcoded — CSS variable resolution is not guaranteed at this
            // stacking level on first paint before fonts/theme are ready
            background: '#006747',
            zIndex: 999999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontFamily: 'Georgia, serif',
              fontWeight: 800,
              fontSize: 36,
              color: 'white',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            WaveRow
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
