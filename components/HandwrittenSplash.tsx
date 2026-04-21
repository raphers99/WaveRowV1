'use client'

import React, { useEffect, useState } from 'react'

/**
 * BrandSplash
 * Redesigned to use the official Playfair Display font on Tulane Green background.
 * Simulates a "writing" reveal by masking the text from left to right.
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

    // Standard timing: 1.8s animation + 500ms pause + 600ms fade out
    const timer = setTimeout(() => {
      setIsFadingOut(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 600)
    }, 2800)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#006747', // Tulane Green
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <h1 
          className="brand-logo-text"
          style={{ 
            fontFamily: 'var(--font-playfair)', 
            fontSize: 'min(64px, 15vw)', 
            fontWeight: 800, 
            color: 'white', 
            margin: 0,
            letterSpacing: '-0.02em',
            position: 'relative',
            display: 'inline-block',
            // Simple fallbacks for non-WebKit browsers
            maskImage: 'linear-gradient(to right, white var(--reveal-percent), transparent var(--reveal-percent))',
            WebkitMaskImage: 'linear-gradient(to right, white var(--reveal-percent), transparent var(--reveal-percent))',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        >
          WaveRow
        </h1>
        
        {/* Subtle underline that also "writes" out */}
        <div 
          style={{
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.4)',
            marginTop: '8px',
            borderRadius: '1px',
            animation: 'drawUnderline 1.4s cubic-bezier(0.65, 0, 0.35, 1) forwards 0.4s',
            width: 0,
            margin: '8px auto 0'
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @property --reveal-percent {
          syntax: '<percentage>';
          inherits: false;
          initial-value: 0%;
        }

        .brand-logo-text {
          animation: revealWriting 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }

        @keyframes revealWriting {
          from {
            --reveal-percent: 0%;
            opacity: 0.5;
            transform: translateY(2px);
          }
          to {
            --reveal-percent: 100%;
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes drawUnderline {
          to {
            width: 60%;
          }
        }
      `}} />
    </div>
  )
}
