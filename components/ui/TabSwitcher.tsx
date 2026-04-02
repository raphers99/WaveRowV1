'use client'
import { motion } from 'framer-motion'
import type { TabSwitcherProps } from '@/types'

export function TabSwitcher({ tabs, active, onChange }: TabSwitcherProps) {
  return (
    <div style={{
      display: 'flex', background: 'rgba(0,103,71,0.06)',
      borderRadius: 12, padding: 4, gap: 2,
    }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            position: 'relative', flex: 1,
            padding: '8px 12px', fontSize: 13, fontWeight: 500,
            border: 'none', background: 'none', cursor: 'pointer',
            color: active === tab ? 'white' : 'var(--text-secondary)',
            fontFamily: 'var(--font-dm-sans)', zIndex: 1,
            borderRadius: 9, transition: 'color 0.2s',
          }}
        >
          {active === tab && (
            <motion.div
              layoutId="tabIndicator"
              style={{
                position: 'absolute', inset: 0,
                background: 'var(--olive)', borderRadius: 9, zIndex: -1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          {tab}
        </button>
      ))}
    </div>
  )
}
