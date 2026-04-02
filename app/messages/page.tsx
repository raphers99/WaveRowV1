'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { ConversationList } from '@/components/messages/ConversationList'
import { MessageThread } from '@/components/messages/MessageThread'
import { fetchConversations } from '@/lib/api'
import { fadeUp } from '@/lib/motion'
import type { Conversation } from '@/types'

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(searchParams.get('conversation'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return }
      setUserId(data.session.user.id)
      fetchConversations(data.session.user.id)
        .then(setConversations)
        .catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [router])

  const active = conversations.find(c => c.id === activeId)
  const otherUserId = active ? (active.participant_one === userId ? active.participant_two : active.participant_one) : ''

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 64, height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Mobile: show thread when active */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Conversation list */}
        <div style={{
          width: active ? '0' : '100%',
          maxWidth: 360,
          overflowY: 'auto',
          borderRight: '0.5px solid rgba(0,103,71,0.08)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
        }}
          className={active ? 'hidden-mobile' : ''}
        >
          <div style={{ padding: '16px 16px 8px' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Messages</h1>
          </div>
          {loading ? (
            <p style={{ padding: 16, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)' }}>Loading...</p>
          ) : (
            <ConversationList conversations={conversations} activeId={activeId} onSelect={setActiveId} />
          )}
        </div>

        {/* Thread */}
        {activeId && userId && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setActiveId(null)} aria-label="Back" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                <ChevronLeft size={20} color="var(--text-primary)" />
              </button>
              <h2 style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Conversation</h2>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MessageThread conversationId={activeId} userId={userId} otherUserId={otherUserId} />
            </div>
          </div>
        )}

        {!activeId && !loading && conversations.length === 0 && (
          <div style={{ flex: 1, display: 'none' }} />
        )}
      </div>
    </div>
  )
}
