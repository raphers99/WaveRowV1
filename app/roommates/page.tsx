'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { TabSwitcher } from '@/components/ui'
import { staggerContainer, fadeUp } from '@/lib/motion'

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const LIFESTYLE_OPTIONS = ['Early bird', 'Night owl', 'Non-smoker', 'Pet owner', 'Remote work', 'Quiet', 'Social', 'Clean', 'Cook', 'Gym-goer']
const TABS = ['Find a Roommate', 'Find a Group']

type RoommateProfile = {
  id: string; user_id: string; budget_min: number; budget_max: number;
  move_in_date: string; lifestyle: string[]; cleanliness: number;
  bio: string | null; neighborhood: string | null; year: string | null; major: string | null;
  name?: string;
}

type RoommateGroup = {
  id: string; created_by: string; total_size: number; budget_min: number; budget_max: number;
  lifestyle: string[]; description: string | null; neighborhood: string | null; move_in_date: string;
  member_count?: number; creator_name?: string;
}

export default function RoommatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [showCreate, setShowCreate] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<RoommateProfile[]>([])
  const [groups, setGroups] = useState<RoommateGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  // Create profile form
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [moveIn, setMoveIn] = useState('')
  const [lifestyle, setLifestyle] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [major, setMajor] = useState('')
  const [saving, setSaving] = useState(false)
  const [createMode, setCreateMode] = useState<'profile' | 'group' | null>(null)

  // Create group form
  const [groupSize, setGroupSize] = useState('3')
  const [groupBudgetMin, setGroupBudgetMin] = useState('')
  const [groupBudgetMax, setGroupBudgetMax] = useState('')
  const [groupMoveIn, setGroupMoveIn] = useState('')
  const [groupNeighborhood, setGroupNeighborhood] = useState('')
  const [groupDesc, setGroupDesc] = useState('')

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return }
      setUserId(data.session.user.id)
      loadData(data.session.user.id)
    })
  }, [])

  async function loadData(uid: string) {
    setLoading(true)
    const supabase = getSupabase()
    const [profilesRes, groupsRes, myProfileRes] = await Promise.all([
      supabase.from('roommate_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('roommate_groups').select('*').order('created_at', { ascending: false }),
      supabase.from('roommate_profiles').select('id').eq('user_id', uid).single(),
    ])
    if (myProfileRes.data) setHasProfile(true)

    const enrichedProfiles = await Promise.all((profilesRes.data ?? []).map(async (p: RoommateProfile) => {
      const { data: prof } = await supabase.from('profiles').select('name').eq('user_id', p.user_id).single()
      return { ...p, name: prof?.name ?? 'Student' }
    }))
    setProfiles(enrichedProfiles)

    const enrichedGroups = await Promise.all((groupsRes.data ?? []).map(async (g: RoommateGroup) => {
      const [{ count }, { data: creator }] = await Promise.all([
        supabase.from('roommate_group_members').select('*', { count: 'exact', head: true }).eq('group_id', g.id),
        supabase.from('profiles').select('name').eq('user_id', g.created_by).single(),
      ])
      return { ...g, member_count: count ?? 1, creator_name: creator?.name ?? 'Someone' }
    }))
    setGroups(enrichedGroups)
    setLoading(false)
  }

  async function handleCreateProfile() {
    if (!userId || !budgetMin || !budgetMax || !moveIn) return
    setSaving(true)
    const supabase = getSupabase()
    await supabase.from('roommate_profiles').upsert({
      user_id: userId,
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
      move_in_date: moveIn,
      lifestyle,
      cleanliness: 3,
      bio: bio || null,
      neighborhood: neighborhood || null,
      major: major || null,
      verified: false,
    }, { onConflict: 'user_id' })
    setSaving(false)
    setShowCreate(false)
    setCreateMode(null)
    setHasProfile(true)
    await loadData(userId)
  }

  async function handleCreateGroup() {
    if (!userId || !groupBudgetMin || !groupBudgetMax || !groupMoveIn) return
    setSaving(true)
    const supabase = getSupabase()
    const { data: group } = await supabase.from('roommate_groups').insert({
      created_by: userId,
      total_size: Number(groupSize),
      budget_min: Number(groupBudgetMin),
      budget_max: Number(groupBudgetMax),
      lifestyle,
      description: groupDesc || null,
      neighborhood: groupNeighborhood || null,
      move_in_date: groupMoveIn,
      verified: false,
    }).select().single()
    if (group) {
      await supabase.from('roommate_group_members').insert({ group_id: group.id, user_id: userId })
    }
    setSaving(false)
    setShowCreate(false)
    setCreateMode(null)
    await loadData(userId)
  }

  async function handleMessage(otherUserId: string) {
    if (!userId) { router.push('/login'); return }
    const supabase = getSupabase()
    const { data: existing } = await supabase.from('conversations').select('id')
      .or(`and(participant_one.eq.${userId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${userId})`)
      .single()
    if (existing) { router.push(`/messages?conversation=${existing.id}`); return }
    const { data: conv } = await supabase.from('conversations').insert({ participant_one: userId, participant_two: otherUserId, listing_id: null }).select().single()
    if (conv) router.push(`/messages?conversation=${conv.id}`)
  }

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
              {loading ? (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Loading...</p>
              ) : profiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <Users size={48} color="var(--text-muted)" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>No roommate profiles yet.</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Be the first to create one!</p>
                </div>
              ) : profiles.map((p, i) => (
                <motion.div key={p.id} variants={fadeUp} custom={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16, color: 'white' }}>{(p.name ?? 'S')[0].toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 2px' }}>{p.name}</h3>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                        {new Date(p.move_in_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 6px' }}>${p.budget_min}–${p.budget_max}/mo{p.neighborhood ? ` · ${p.neighborhood}` : ''}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.lifestyle.slice(0, 3).map(t => (
                        <span key={t} style={{ background: 'rgba(65,182,230,0.1)', color: '#2563eb', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  {userId && p.user_id !== userId && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleMessage(p.user_id)}
                      style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                      Message
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="groups" variants={staggerContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading ? (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Loading...</p>
              ) : groups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <Users size={48} color="var(--text-muted)" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>No groups yet.</p>
                </div>
              ) : groups.map((g, i) => (
                <motion.div key={g.id} variants={fadeUp} custom={i} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: 0 }}>
                      {g.neighborhood ? `${g.neighborhood} group` : `${g.total_size}-person group`}
                    </h3>
                    <span style={{ background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)', flexShrink: 0, marginLeft: 8 }}>
                      {g.member_count}/{g.total_size} members
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 10px' }}>
                    ${g.budget_min}–${g.budget_max}/mo · Looking for {g.total_size - (g.member_count ?? 1)} more
                  </p>
                  {g.description && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px' }}>{g.description}</p>}
                  {userId && g.created_by !== userId && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleMessage(g.created_by)}
                      style={{ background: 'transparent', border: '1.5px solid var(--olive)', color: 'var(--olive)', borderRadius: 10, padding: '8px 20px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Message Group
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreate(true)}
        style={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 20, width: 52, height: 52, borderRadius: '50%', background: 'var(--olive)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,103,71,0.4)', zIndex: 30 }}
        aria-label="Create"
      >
        <Plus size={24} color="white" strokeWidth={2.5} />
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
            onClick={() => { setShowCreate(false); setCreateMode(null) }}
          >
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', maxHeight: '85dvh', overflowY: 'auto' }}
            >
              {!createMode ? (
                <>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Create</h3>
                  {[{ label: hasProfile ? 'Update My Roommate Profile' : 'Create Roommate Profile', mode: 'profile' as const }, { label: 'Create a Group', mode: 'group' as const }].map(opt => (
                    <button key={opt.label} onClick={() => setCreateMode(opt.mode)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 0', background: 'none', border: 'none', borderBottom: '0.5px solid rgba(0,103,71,0.08)', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      {opt.label}
                    </button>
                  ))}
                </>
              ) : createMode === 'profile' ? (
                <>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Roommate Profile</h3>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p className="label-style" style={{ marginBottom: 4 }}>Budget Min</p>
                      <input className="input" type="number" placeholder="800" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="label-style" style={{ marginBottom: 4 }}>Budget Max</p>
                      <input className="input" type="number" placeholder="1400" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} />
                    </div>
                  </div>
                  <p className="label-style" style={{ marginBottom: 4 }}>Move-in Date</p>
                  <input className="input" type="date" value={moveIn} onChange={e => setMoveIn(e.target.value)} style={{ marginBottom: 12 }} />
                  <p className="label-style" style={{ marginBottom: 4 }}>Neighborhood (optional)</p>
                  <input className="input" placeholder="Uptown, Garden District..." value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={{ marginBottom: 12 }} />
                  <p className="label-style" style={{ marginBottom: 4 }}>Major (optional)</p>
                  <input className="input" placeholder="Business, Pre-med..." value={major} onChange={e => setMajor(e.target.value)} style={{ marginBottom: 12 }} />
                  <p className="label-style" style={{ marginBottom: 8 }}>Lifestyle</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {LIFESTYLE_OPTIONS.map(o => (
                      <button key={o} onClick={() => setLifestyle(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])}
                        style={{ padding: '6px 12px', borderRadius: 99, border: `1.5px solid ${lifestyle.includes(o) ? 'var(--olive)' : 'rgba(0,103,71,0.15)'}`, background: lifestyle.includes(o) ? 'rgba(0,103,71,0.08)' : 'white', color: lifestyle.includes(o) ? 'var(--olive)' : 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: lifestyle.includes(o) ? 600 : 400, cursor: 'pointer' }}>
                        {o}
                      </button>
                    ))}
                  </div>
                  <p className="label-style" style={{ marginBottom: 4 }}>Bio (optional)</p>
                  <textarea className="input" rows={2} placeholder="A bit about yourself..." value={bio} onChange={e => setBio(e.target.value)} style={{ marginBottom: 16, resize: 'none' }} />
                  <button onClick={handleCreateProfile} disabled={saving || !budgetMin || !budgetMax || !moveIn}
                    style={{ width: '100%', background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </>
              ) : (
                <>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Create a Group</h3>
                  <p className="label-style" style={{ marginBottom: 4 }}>Group Size</p>
                  <input className="input" type="number" min="2" max="6" value={groupSize} onChange={e => setGroupSize(e.target.value)} style={{ marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p className="label-style" style={{ marginBottom: 4 }}>Budget Min</p>
                      <input className="input" type="number" placeholder="1200" value={groupBudgetMin} onChange={e => setGroupBudgetMin(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="label-style" style={{ marginBottom: 4 }}>Budget Max</p>
                      <input className="input" type="number" placeholder="2000" value={groupBudgetMax} onChange={e => setGroupBudgetMax(e.target.value)} />
                    </div>
                  </div>
                  <p className="label-style" style={{ marginBottom: 4 }}>Move-in Date</p>
                  <input className="input" type="date" value={groupMoveIn} onChange={e => setGroupMoveIn(e.target.value)} style={{ marginBottom: 12 }} />
                  <p className="label-style" style={{ marginBottom: 4 }}>Neighborhood (optional)</p>
                  <input className="input" placeholder="Uptown, Garden District..." value={groupNeighborhood} onChange={e => setGroupNeighborhood(e.target.value)} style={{ marginBottom: 12 }} />
                  <p className="label-style" style={{ marginBottom: 4 }}>Description (optional)</p>
                  <textarea className="input" rows={2} placeholder="Tell others about your group..." value={groupDesc} onChange={e => setGroupDesc(e.target.value)} style={{ marginBottom: 16, resize: 'none' }} />
                  <button onClick={handleCreateGroup} disabled={saving || !groupBudgetMin || !groupBudgetMax || !groupMoveIn}
                    style={{ width: '100%', background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                    {saving ? 'Creating...' : 'Create Group'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
