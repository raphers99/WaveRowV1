'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import type { Listing } from '@/types'

const SEMESTERS = [
  { label: 'Spring 2025', start: '2025-01-01', end: '2025-05-31' },
  { label: 'Fall 2025', start: '2025-08-01', end: '2025-12-31' },
  { label: 'Spring 2026', start: '2026-01-01', end: '2026-05-31' },
]

export function SubletClient({ initialListings }: { initialListings: Listing[] }) {
  const [activeSemester, setActiveSemester] = useState(SEMESTERS[1].label)

  const filtered = useMemo(() => {
    const sem = SEMESTERS.find(s => s.label === activeSemester)
    if (!sem) return initialListings
    return initialListings.filter(l => {
      if (!l.available_from) return true
      const d = new Date(l.available_from)
      return d >= new Date(sem.start) && d <= new Date(sem.end)
    })
  }, [initialListings, activeSemester])

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 16px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Student Sublets</h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', marginBottom: 20 }}>Semester-length leases from students.</p>

        {/* Semester tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
          {SEMESTERS.map(s => (
            <button
              key={s.label}
              onClick={() => setActiveSemester(s.label)}
              style={{
                padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                fontFamily: 'var(--font-dm-sans)', border: 'none', cursor: 'pointer',
                background: activeSemester === s.label ? 'var(--olive)' : 'white',
                color: activeSemester === s.label ? 'white' : 'var(--text-secondary)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)' }}>No sublets available for {activeSemester}.</p>
          </div>
        ) : (
          <ListingGrid listings={filtered} onCardClick={() => {}} onSave={() => {}} />
        )}
      </div>
    </div>
  )
}
