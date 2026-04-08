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

// ─── E2EE Crypto Setup ───────────────────────────────────────────────────────
async function getConversationKey(conversationId: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(conversationId), { name: 'PBKDF2' }, false, ['deriveKey']
  )
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('waverow_secret_salt_v1'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  )
}

async function encryptMessage(text: string, convId: string): Promise<string> {
  const key = await getConversationKey(convId)
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)
  const cipher = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return JSON.stringify({ iv: Array.from(iv), cipher: Array.from(new Uint8Array(cipher)) })
}

async function decryptMessage(payloadStr: string, convId: string): Promise<string> {
  try {
    const payload = JSON.parse(payloadStr)
    if (!payload.cipher) return payloadStr
    const key = await getConversationKey(convId)
    const iv = new Uint8Array(payload.iv)
    const cipher = new Uint8Array(payload.cipher)
    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
    return new TextDecoder().decode(decrypted)
  } catch {
    return payloadStr // fallback for plaintext database seeds
  }
}

type OptimisticMessage = Message & { status?: 'pending' | 'failed' }

export function MessageThread({ conversationId, userId, otherUserId }: { conversationId: string; userId: string; otherUserId: string }) {
  const [messages, setMessages] = useState<OptimisticMessage[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetchMessages(conversationId)
      .then(async (data) => {
        const decrypted = await Promise.all(data.map(async (m: Message) => ({ ...m, body: await decryptMessage(m.body, conversationId) })))
        setMessages(decrypted)
      })
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
      }, async (payload) => {
        const originalMsg = payload.new as Message
        const newMsg = { ...originalMsg, body: await decryptMessage(originalMsg.body, conversationId) }
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
      const encryptedBody = await encryptMessage(body, conversationId)
      await sendMessage(userId, otherUserId, conversationId, encryptedBody)
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
