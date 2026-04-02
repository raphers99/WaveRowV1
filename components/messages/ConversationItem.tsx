'use client'
import { motion } from 'framer-motion'
import type { Conversation } from '@/types'

export function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onClick,
}: {
  conversation: Conversation
  currentUserId: string
  isSelected: boolean
  onClick: () => void
}) {
  const otherParticipant = conversation.participant_one === currentUserId
    ? conversation.participant_two
    : conversation.participant_one

  const time = conversation.last_message_at
    ? new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  const initials = otherParticipant.slice(0, 2).toUpperCase()

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(0,103,71,0.04)' }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        cursor: 'pointer',
        background: isSelected ? 'rgba(0,103,71,0.06)' : 'transparent',
        borderLeft: isSelected ? '3px solid var(--olive)' : '3px solid transparent',
        transition: 'background 0.15s ease',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(0,103,71,0.12)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 14, color: 'var(--olive)',
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {otherParticipant.slice(0, 8)}...
          </span>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{time}</span>
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {conversation.last_message ?? 'No messages yet'}
        </p>
      </div>
    </motion.div>
  )
}
