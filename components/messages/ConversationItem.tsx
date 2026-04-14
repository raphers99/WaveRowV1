'use client'
import { motion } from 'framer-motion'
import type { Conversation } from '@/types'

function previewText(raw: string | null | undefined): string {
  if (!raw) return 'No messages yet'
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'iv' in parsed && 'cipher' in parsed) {
      return 'Message'
    }
  } catch {
    // not JSON — plain text, fall through
  }
  return raw
}

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
  const displayName = conversation.other_user_name
    || conversation.listing_title
    || 'Continue Conversation'

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const time = conversation.last_message_at
    ? new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

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
            {displayName}
          </span>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{time}</span>
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {previewText(conversation.last_message)}
        </p>
      </div>
    </motion.div>
  )
}
