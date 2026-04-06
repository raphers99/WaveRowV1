'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { fetchMessages, sendMessage } from '@/lib/api'
import { createBrowserClient } from '@supabase/ssr'
import { trackEvent } from '@/lib/analytics'
import type { Message } from '@/types'

export function MessageThread({ conversationId, userId, otherUserId }: { conversationId: string; userId: string; otherUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetchMessages(conversationId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false))

    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages(m => {
          if (m.find(x => x.id === newMsg.id)) return m
          return [...m, newMsg]
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(body: string) {
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      sender_id: userId,
      receiver_id: otherUserId,
      listing_id: null,
      conversation_id: conversationId,
      body,
      read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(m => [...m, optimistic])
    trackEvent('send_message', { conversation_id: conversationId, screen_name: 'messages' })
    await sendMessage(userId, otherUserId, conversationId, body).catch(() => {})
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>
        ) : messages.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>No messages yet. Start the conversation.</p>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === userId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  )
}
