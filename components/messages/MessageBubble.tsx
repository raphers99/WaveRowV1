'use client'
import type { Message } from '@/types'

export function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
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
        <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', textAlign: 'right' }}>{time}</span>
      </div>
    </div>
  )
}
