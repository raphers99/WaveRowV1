'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { helpBotAction } from '@/app/actions/helpBot'

type Message = { id: string; role: 'user' | 'assistant'; content: string }

export default function HelpBot() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Hi there! I am the WaveRow assistant. How can I help you find housing in New Orleans today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAuthenticated(true)
    })
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isExpanded])

  if (!isAuthenticated) return null

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    
    const newMessage: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    const history = messages.map(m => ({ role: m.role, content: m.content }))
    
    try {
      const respContent = await helpBotAction(history, trimmed)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: respContent }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Something went wrong — try again' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none' }}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ 
              pointerEvents: 'auto',
              background: 'var(--surface)', 
              borderRadius: 24, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
              marginBottom: 16, 
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
            className="helpbot-card"
          >
            {/* Header */}
            <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>WaveRow Help</h3>
              <button aria-label="Close Help Bot" onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.role === 'user' ? 'var(--olive)' : 'white',
                    color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.05)',
                    fontFamily: 'var(--font-dm-sans)', fontSize: 14, lineHeight: 1.5,
                    boxShadow: m.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ width: 48, height: 28, background: 'white', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--olive)' }} />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--olive)' }} />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--olive)' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', padding: 12 }}>
              <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <textarea 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={2}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-primary)', padding: '6px 0' }}
                />
                <button aria-label="Send Message" onClick={handleSend} disabled={!input.trim() || isLoading} style={{ background: 'var(--olive)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isLoading ? 'pointer' : 'default', opacity: input.trim() && !isLoading ? 1 : 0.5, flexShrink: 0, paddingRight: 2 }}>
                  <Send size={16} color="white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        aria-label={isExpanded ? "Close Help Bot" : "Open Help Bot"}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          pointerEvents: 'auto',
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--olive)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,103,71,0.4)',
          cursor: 'pointer', zIndex: 10000
        }}
      >
        <AnimatePresence mode="popLayout">
          {isExpanded ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={24} color="white" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={28} color="white" strokeWidth={2.2} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        .helpbot-card { width: 360px; height: 480px; }
        @media (max-width: 500px) {
          .helpbot-card { width: calc(100vw - 32px); height: 55vh; }
        }
      `}} />
    </div>
  )
}
