'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { fetchMessages, sendMessage } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { toast } from '@/components/ui'
import type { Message } from '@/types'

type OptimisticMessage = Message & { status?: 'pending' | 'failed' }

export function MessageThread({ conversationId, userId, otherUserId }: { conversationId: string; userId: string; otherUserId: string }) {
  const [messages, setMessages] = useState<OptimisticMessage[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetchMessages(conversationId)
      .then(setMessages)
      .catch(() => { toast.show('Could not load messages', 'error') })
      .finally(() => setLoading(false))

    const supabase = createClient()
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
          // Replace optimistic message if it exists, otherwise add
          const optimisticId = m.find(x => x.status === 'pending' && x.body === newMsg.body)?.id
          if (optimisticId) {
            return m.map(x => x.id === optimisticId ? newMsg : x)
          }
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

  async function handleSend(body: string, tempId?: string) {
    const optimisticId = tempId ?? `tmp-${Date.now()}`
    const optimisticMsg: OptimisticMessage = {
      id: optimisticId,
      sender_id: userId,
      receiver_id: otherUserId,
      listing_id: null,
      conversation_id: conversationId,
      body,
      read: false,
      created_at: new Date().toISOString(),
      status: 'pending',
    }

    if (tempId) {
      // This is a retry, so we update the existing message
      setMessages(m => m.map(msg => msg.id === tempId ? optimisticMsg : msg))
    } else {
      setMessages(m => [...m, optimisticMsg])
    }
    
    trackEvent('send_message', { conversation_id: conversationId, screen_name: 'messages' })
    
    try {
      await sendMessage(userId, otherUserId, conversationId, body)
      // The realtime subscription will handle replacing the optimistic message
    } catch {
      setMessages(m => m.map(msg => msg.id === optimisticId ? { ...msg, status: 'failed' } : msg))
      toast.show('Message failed to send — tap to retry', 'error')
    }
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
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === userId}
              onRetry={() => handleSend(msg.body, msg.id)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  )
}
