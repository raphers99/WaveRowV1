'use client'

import { useEffect } from 'react'

/**
 * NativeBridge handles Capacitor-specific global side-effects.
 * It is designed to be completely safe on both Web and Native (iOS/Android).
 */
export function NativeBridge() {
  useEffect(() => {
    // Only run on Capacitor
    const init = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        
        if (Capacitor.isNativePlatform()) {
          // 1. Hide the splash screen after the React app has mounted and painted
          const { SplashScreen } = await import('@capacitor/splash-screen')
          await SplashScreen.hide({ fadeOutDuration: 200 })
          
          // 2. Additional native-only setup can go here
          // (e.g. status bar styling, keyboard listeners etc.)
        }
      } catch (err) {
        console.warn('[NativeBridge] Initialization failed:', err)
      }
    }

    init()
  }, [])

  return null
}
