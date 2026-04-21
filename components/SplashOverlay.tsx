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
      // Show the React-managed animated overlay, then hide the static
      // pre-hydration div on the next frame (once overlay is painted).
      // IMPORTANT: use display:none — never call .remove() on a node owned
      // by React's tree. Removing it causes insertBefore/removeChild crashes
      // on every subsequent navigation.
      setVisible(true)
      requestAnimationFrame(() => {
        if (initialLoader) initialLoader.style.display = 'none'
      })
      const timer = setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem('splash_shown', '1')
      }, 2200)
      return () => clearTimeout(timer)
    } else {
      // Warm start: fade out then hide. Never remove from DOM.
      if (initialLoader) {
        initialLoader.style.transition = 'opacity 0.25s ease'
        initialLoader.style.opacity = '0'
        setTimeout(() => { initialLoader.style.display = 'none' }, 250)
      }
    }
  }, [])

  return null
}
