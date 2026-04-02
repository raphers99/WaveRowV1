import { Suspense } from 'react'
import { MessagesContent } from './MessagesContent'

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
