'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { TabSwitcher } from '@/components/ui'
import { staggerContainer, fadeUp } from '@/lib/motion'

const MOCK_PROFILES = [
  { id: '1', name: 'Alex M.', budget: '$800–$1200', moveIn: 'Aug 2025', tags: ['Early bird', 'Non-smoker', 'Gym-goer'] },
  { id: '2', name: 'Jordan L.', budget: '$900–$1400', moveIn: 'Aug 2025', tags: ['Night owl', 'Pet owner', 'Remote work'] },
  { id: '3', name: 'Sam T.', budget: '$700–$1000', moveIn: 'Jan 2026', tags: ['Quiet', 'Non-smoker', 'Cook'] },
]

const MOCK_GROUPS = [
  { id: '1', name: 'Uptown 3-bed crew', members: 2, total: 3, budget: '$1200–$1800', looking: 1 },
  { id: '2', name: 'Garden District house', members: 3, total: 4, budget: '$1400–$2000', looking: 1 },
]

const TABS = ['Find a Roommate', 'Find a Group']

export default function RoommatesPage() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 20px' }}>Roommates</h1>

        <div style={{ marginBottom: 24 }}>
          <TabSwitcher tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Find a Roommate' ? (
            <motion.div key="profiles" variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_PROFILES.map((p, i) => (
                <motion.div key={p.id} variants={fadeUp} custom={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16, color: 'white' }}>{p.name[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px' }}>{p.name}</h3>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{p.moveIn}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px' }}>{p.budget}/mo</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.tags.map(t => (
                        <span key={t} style={{ background: 'rgba(65,182,230,0.1)', color: 'var(--sky)', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                    Message
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="groups" variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_GROUPS.map((g, i) => (
                <motion.div key={g.id} variants={fadeUp} custom={i} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: 0 }}>{g.name}</h3>
                    <span style={{ background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)', flexShrink: 0, marginLeft: 8 }}>
                      {g.members}/{g.total} members
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }}>{g.budget}/mo · Looking for {g.looking} more</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ background: 'transparent', border: '1.5px solid var(--olive)', color: 'var(--olive)', borderRadius: 10, padding: '8px 20px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    View Group
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreate(true)}
        style={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 20, width: 52, height: 52, borderRadius: '50%', background: 'var(--olive)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,103,71,0.4)', zIndex: 30 }}
        aria-label="Create"
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>

      {/* Create bottom sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px' }}
            >
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Create</h3>
              {['Create Roommate Profile', 'Create a Group'].map(opt => (
                <button key={opt} onClick={() => setShowCreate(false)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', background: 'none', border: 'none', borderBottom: '0.5px solid rgba(0,103,71,0.08)', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  {opt}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
