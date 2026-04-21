'use client'

import React, { useEffect, useState } from 'react'

/**
 * HandwrittenSplash
 * A premium loading screen with a custom SVG handwriting animation.
 * Uses stroke-dasharray/offset for the 'draw' effect.
 */
export default function HandwrittenSplash() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Check for skip flag (for testing/debugging)
    const isSkipped = localStorage.getItem('disable_splash') === 'true' || 
                      window.location.search.includes('disable_splash=true')
    
    if (isSkipped) {
      setIsVisible(false)
      return
    }

    // Total duration: 2s (draw) + 500ms (hold) = 2.5s before fade
    const timer = setTimeout(() => {
      setIsFadingOut(true)
      // Allow 600ms for the CSS transition to complete before unmounting
      setTimeout(() => {
        setIsVisible(false)
      }, 600)
    }, 2800)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="splash-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#FAFAF8',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 600ms cubic-bezier(0.4, 0, 1, 1)',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <div style={{ width: 'min(85vw, 450px)', textAlign: 'center' }}>
        <svg
          viewBox="0 0 500 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#1A1A1A', width: '100%', height: 'auto' }}
        >
          {/* Handwritten-style WaveRow lettering using SVG paths */}
          {/* W */}
          <path 
            d="M50 80C55 50 65 30 75 30C85 30 75 80 90 80C105 80 115 30 130 30" 
            className="draw-path"
            style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw 1.8s ease-in-out forwards' }}
          />
          {/* a */}
          <path 
            d="M145 65C145 55 160 55 160 65C160 75 145 75 145 65M160 55V75" 
            className="draw-path"
            style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'draw 1.4s ease-in-out forwards 0.3s' }}
          />
          {/* v */}
          <path 
            d="M175 55L185 75L195 55" 
            className="draw-path"
            style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'draw 1.2s ease-in-out forwards 0.6s' }}
          />
          {/* e */}
          <path 
            d="M210 65H230C230 55 210 55 210 65C210 75 230 75 230 65" 
            className="draw-path"
            style={{ strokeDasharray: 120, strokeDashoffset: 120, animation: 'draw 1.5s ease-in-out forwards 0.8s' }}
          />
          {/* R */}
          <path 
            d="M260 80V30C260 30 290 20 290 40C290 60 260 55 260 55L290 80" 
            className="draw-path"
            style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw 1.8s ease-in-out forwards 1.1s' }}
          />
          {/* o */}
          <path 
            d="M310 65C310 55 330 55 330 65C330 75 310 75 310 65" 
            className="draw-path"
            style={{ strokeDasharray: 120, strokeDashoffset: 120, animation: 'draw 1.4s ease-in-out forwards 1.4s' }}
          />
          {/* w */}
          <path 
            d="M350 55V75C350 75 365 85 375 75C385 65 375 55 375 55V75C375 75 390 85 400 75" 
            className="draw-path"
            style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw 1.8s ease-in-out forwards 1.6s' }}
          />
        </svg>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .draw-path {
          /* Add a subtle variable stroke feel if possible, 
             otherwise keep it clean as requested */
        }
      `}} />
    </div>
  )
}
