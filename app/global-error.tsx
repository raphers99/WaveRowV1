'use client'

/**
 * Root-level error boundary. This file is required to catch errors that occur
 * in the root layout (AppShell, Navbar, BottomNav, providers) — app/error.tsx
 * cannot catch those. Without this file, any throw in the root layout shows
 * Next.js's raw __next_error__ page instead of a graceful fallback.
 *
 * Must include <html> and <body> — it replaces the entire document.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#FAFAF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 320 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(239,68,68,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#1a1a1a',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: 14,
              color: '#666',
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}
          >
            We&apos;re looking into it. Please reload and try again.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: '#006747',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '11px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
            <button
              onClick={() => {
                window.location.href = '/'
              }}
              style={{
                background: 'white',
                color: '#333',
                border: '1.5px solid rgba(0,0,0,0.1)',
                borderRadius: 12,
                padding: '11px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
