'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { ConversationList } from '@/components/messages/ConversationList'
import { MessageThread } from '@/components/messages/MessageThread'
import { fetchConversations } from '@/lib/api'
import type { Conversation } from '@/types'

function getSupabase() {
  return createClient()
}

export function MessagesContent() {
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
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: activeId ? 0 : 'calc(64px + env(safe-area-inset-bottom))', height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: active ? '0' : '100%', overflowY: 'auto', borderRight: active ? '0.5px solid rgba(0,103,71,0.08)' : 'none', display: 'flex', flexDirection: 'column', transition: 'width 0.2s' }}>
          <div style={{ padding: '16px 16px 8px' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Messages</h1>
          </div>
          {loading ? (
            <p style={{ padding: 16, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)' }}>Loading...</p>
          ) : conversations.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MessageCircle size={26} color="var(--olive)" />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 8px' }}>No messages yet</p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>Contact a landlord from any listing to start a conversation.</p>
              <motion.a
                href="/"
                whileTap={{ scale: 0.97 }}
                style={{ background: 'var(--olive)', color: 'white', borderRadius: 12, padding: '11px 24px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
              >
                Browse Listings
              </motion.a>
            </div>
          ) : (
            <ConversationList conversations={conversations} activeId={activeId} onSelect={setActiveId} currentUserId={userId ?? ''} />
          )}
        </div>

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
      </div>
    </div>
  )
}
