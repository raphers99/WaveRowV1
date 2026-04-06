'use client'

import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { ConversationItem } from './ConversationItem'
import type { Conversation } from '@/types'

export function ConversationList({ conversations, activeId, onSelect, currentUserId }: { conversations: Conversation[]; activeId: string | null; onSelect: (id: string) => void; currentUserId: string }) {
  if (conversations.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)' }}>No conversations yet</p>
      </div>
    )
  }
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column' }}>
      {conversations.map((c, i) => (
        <motion.div key={c.id} variants={fadeUp} custom={i}>
          <ConversationItem conversation={c} currentUserId={currentUserId} isSelected={c.id === activeId} onClick={() => onSelect(c.id)} />
        </motion.div>
      ))}
    </motion.div>
  )
}
