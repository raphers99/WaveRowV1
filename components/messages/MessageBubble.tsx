'use client'
import type { Message } from '@/types'

type OptimisticMessage = Message & { status?: 'pending' | 'failed' }

export function MessageBubble({ message, isOwn, onRetry }: { message: OptimisticMessage; isOwn: boolean; onRetry: () => void }) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isOptimistic = !!message.status

  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 8, opacity: isOptimistic ? 0.7 : 1 }}>
      <div style={{
        maxWidth: '75%',
        background: isOwn ? 'var(--olive)' : 'white',
        color: isOwn ? 'white' : 'var(--text-primary)',
        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: isOwn ? 'none' : '1px solid rgba(0,103,71,0.08)',
      }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-dm-sans)', fontSize: 15, lineHeight: 1.5 }}>{message.body}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          {message.status === 'failed' && (
            <>
              <span style={{ fontSize: 11, color: '#ef4444' }}>Failed to send</span>
              <button onClick={onRetry} style={{
                background: 'none', border: 'none', color: isOwn ? 'white' : 'var(--olive)',
                textDecoration: 'underline', fontSize: 11, cursor: 'pointer', padding: 0
              }}>
                Retry
              </button>
            </>
          )}
          <span style={{ fontSize: 11, color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
            {message.status === 'pending' ? 'Sending...' : time}
          </span>
        </div>
      </div>
    </div>
  )
}
