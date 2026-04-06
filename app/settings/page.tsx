'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { ChevronLeft, ChevronRight, Bell, Search, Shield, Smartphone, Info, Trash2, LogOut, Moon, Sun, User, Mail } from 'lucide-react'
import { fadeUp } from '@/lib/motion'

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

type Prefs = {
  notif_messages: boolean
  notif_price_drops: boolean
  notif_digest: boolean
  search_neighborhood: string
  search_budget_min: string
  search_budget_max: string
  search_move_in: string
  privacy_hide_roommate: boolean
  privacy_hide_profile: boolean
  landlord_auto_reply: string
  landlord_pause_listings: boolean
}

const DEFAULT_PREFS: Prefs = {
  notif_messages: true,
  notif_price_drops: true,
  notif_digest: false,
  search_neighborhood: '',
  search_budget_min: '',
  search_budget_max: '',
  search_move_in: '',
  privacy_hide_roommate: false,
  privacy_hide_profile: false,
  landlord_auto_reply: '',
  landlord_pause_listings: false,
}

const NEIGHBORHOODS = ['Uptown', 'Carrollton', 'Garden District', 'Mid-City', 'Freret', 'Any']

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
        background: value ? 'var(--olive)' : 'rgba(0,0,0,0.15)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{ position: 'absolute', top: 2, width: 24, height: 24, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
      />
    </button>
  )
}

function SettingsRow({ icon, label, sublabel, right, onClick, destructive }: {
  icon: React.ReactNode; label: string; sublabel?: string;
  right?: React.ReactNode; onClick?: () => void; destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        padding: '14px 0', background: 'none', border: 'none', cursor: onClick ? 'pointer' : 'default',
        borderBottom: '0.5px solid rgba(0,103,71,0.06)', textAlign: 'left',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: destructive ? 'rgba(239,68,68,0.08)' : 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: destructive ? '#ef4444' : 'var(--olive)' }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: 15, color: destructive ? '#ef4444' : 'var(--text-primary)', margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{sublabel}</p>}
      </div>
      {right ?? (onClick && <ChevronRight size={16} color="var(--text-muted)" />)}
    </button>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '24px 0 4px', padding: '0 4px' }}>
      {title}
    </p>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('student')
  const [name, setName] = useState('')
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      setUserId(session.user.id)
      setEmail(session.user.email ?? '')
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle()
      if (profile) {
        setName(profile.name ?? '')
        setRole(profile.role ?? 'student')
        if (profile.preferences) {
          setPrefs({ ...DEFAULT_PREFS, ...profile.preferences })
        }
      }
      const stored = localStorage.getItem('waverow_dark')
      if (stored === 'true') setDarkMode(true)
    })()
  }, [router])

  function updatePref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    await getSupabase().from('profiles').update({ name: name.trim(), preferences: prefs }).eq('user_id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDarkMode(val: boolean) {
    setDarkMode(val)
    localStorage.setItem('waverow_dark', String(val))
    document.documentElement.style.setProperty('--surface', val ? '#0f1a14' : '#FAFAF8')
    document.documentElement.style.setProperty('--text-primary', val ? '#f0f7f3' : '#0f1a14')
    document.documentElement.style.setProperty('--text-secondary', val ? '#a8c4b0' : '#4a5c52')
    document.documentElement.style.setProperty('--text-muted', val ? '#6a8a72' : '#8a9e92')
    document.documentElement.style.setProperty('--card', val ? '#1a2e20' : '#FFFFFF')
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.replace('/login')
  }

  async function handleDeleteAccount() {
    if (!userId) return
    setDeleting(true)
    const supabase = getSupabase()
    await supabase.from('profiles').delete().eq('user_id', userId)
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const sections = [
    { key: 'profile', label: 'Profile', icon: <User size={18} />, sublabel: 'Name, email' },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={18} />, sublabel: 'Messages, price drops, digest' },
    { key: 'search', label: 'Search Preferences', icon: <Search size={18} />, sublabel: 'Default filters & budget' },
    { key: 'privacy', label: 'Privacy', icon: <Shield size={18} />, sublabel: 'Profile visibility & blocking' },
    ...(role === 'landlord' ? [{ key: 'landlord', label: 'Listing Settings', icon: <User size={18} />, sublabel: 'Auto-reply & listing controls' }] : []),
    { key: 'app', label: 'App', icon: <Smartphone size={18} />, sublabel: 'Dark mode, display' },
    { key: 'about', label: 'About', icon: <Info size={18} />, sublabel: 'Version, legal, support' },
  ]
          {/* Profile */}
          {activeSection === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '20px 20px 8px 20px', marginTop: 20, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <SectionHeader title="Name" />
                <input
                  className="input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ marginBottom: 16 }}
                  aria-label="Name"
                />
                <SectionHeader title="Email" />
                <input
                  className="input"
                  type="email"
                  value={email}
                  disabled
                  style={{ marginBottom: 8, background: '#f2f2f7', color: '#888' }}
                  aria-label="Email"
                />
              </div>
            </motion.div>
          )}

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 40, minHeight: '100dvh', background: 'var(--surface)' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 'calc(56px + env(safe-area-inset-top))', zIndex: 40, background: 'rgba(var(--surface-rgb, 250,250,248),0.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(0,103,71,0.08)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => activeSection ? setActiveSection(null) : router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: 15, padding: 0 }}>
          <ChevronLeft size={20} /> {activeSection ? 'Settings' : 'Back'}
        </button>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1, textAlign: 'center' }}>
          {activeSection ? sections.find(s => s.key === activeSection)?.label : 'Settings'}
        </h1>
        {activeSection && (
          <button onClick={handleSave} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, padding: 0 }}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
          </button>
        )}
        {!activeSection && <div style={{ width: 60 }} />}
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
        <AnimatePresence mode="wait">

          {/* Main menu */}
          {!activeSection && (
            <motion.div key="menu" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>

              {/* Profile summary */}
              <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', marginTop: 20, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 20, color: 'white' }}>{name[0]?.toUpperCase() ?? '?'}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>{name}</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>{email}</p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div style={{ background: 'white', borderRadius: 16, padding: '0 20px', marginTop: 16, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                {sections.map(s => (
                  <SettingsRow key={s.key} icon={s.icon} label={s.label} sublabel={s.sublabel} onClick={() => setActiveSection(s.key)} />
                ))}
              </div>

              {/* Account actions */}
              <div style={{ background: 'white', borderRadius: 16, padding: '0 20px', marginTop: 16, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <SettingsRow icon={<LogOut size={18} />} label="Sign Out" onClick={handleSignOut} />
                <SettingsRow icon={<Trash2 size={18} />} label="Delete Account" sublabel="This cannot be undone" onClick={() => setShowDeleteConfirm(true)} destructive />
              </div>

              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>WaveRow v1.0 · Made for Tulane</p>
            </motion.div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '0 20px', marginTop: 20, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <SettingsRow icon={<Mail size={18} />} label="New messages" sublabel="Get notified when someone messages you"
                  right={<Toggle value={prefs.notif_messages} onChange={v => updatePref('notif_messages', v)} />} />
                <SettingsRow icon={<Bell size={18} />} label="Price drops" sublabel="Alert when a saved listing drops in price"
                  right={<Toggle value={prefs.notif_price_drops} onChange={v => updatePref('notif_price_drops', v)} />} />
                <SettingsRow icon={<Bell size={18} />} label="Weekly digest" sublabel="New listings matching your preferences"
                  right={<Toggle value={prefs.notif_digest} onChange={v => updatePref('notif_digest', v)} />} />
              </div>
            </motion.div>
          )}

          {/* Search Preferences */}
          {activeSection === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <SectionHeader title="Default Neighborhood" />
              <div style={{ background: 'white', borderRadius: 16, padding: '4px 20px', boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                {NEIGHBORHOODS.map(n => (
                  <button key={n} onClick={() => updatePref('search_neighborhood', n === 'Any' ? '' : n)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 0', background: 'none', border: 'none', borderBottom: '0.5px solid rgba(0,103,71,0.06)', cursor: 'pointer' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)' }}>{n}</span>
                    {(prefs.search_neighborhood === (n === 'Any' ? '' : n)) && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: 11 }}>✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <SectionHeader title="Budget Range" />
              <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,103,71,0.06)', display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p className="label-style" style={{ marginBottom: 6 }}>Min $</p>
                  <input className="input" type="number" placeholder="600" value={prefs.search_budget_min} onChange={e => updatePref('search_budget_min', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="label-style" style={{ marginBottom: 6 }}>Max $</p>
                  <input className="input" type="number" placeholder="2000" value={prefs.search_budget_max} onChange={e => updatePref('search_budget_max', e.target.value)} />
                </div>
              </div>
              <SectionHeader title="Preferred Move-in" />
              <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <input className="input" type="date" value={prefs.search_move_in} onChange={e => updatePref('search_move_in', e.target.value)} />
              </div>
            </motion.div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '0 20px', marginTop: 20, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <SettingsRow icon={<Shield size={18} />} label="Hide from roommate finder" sublabel="Your profile won't appear in the roommates list"
                  right={<Toggle value={prefs.privacy_hide_roommate} onChange={v => updatePref('privacy_hide_roommate', v)} />} />
                <SettingsRow icon={<User size={18} />} label="Hide profile from others" sublabel="Only people you message can see your profile"
                  right={<Toggle value={prefs.privacy_hide_profile} onChange={v => updatePref('privacy_hide_profile', v)} />} />
              </div>
            </motion.div>
          )}

          {/* Landlord */}
          {activeSection === 'landlord' && (
            <motion.div key="landlord" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <SectionHeader title="Auto-Reply Message" />
              <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                  Automatically send this message to anyone who contacts you about a listing.
                </p>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Thanks for reaching out! I'll get back to you within 24 hours..."
                  value={prefs.landlord_auto_reply}
                  onChange={e => updatePref('landlord_auto_reply', e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>
              <SectionHeader title="Listing Controls" />
              <div style={{ background: 'white', borderRadius: 16, padding: '0 20px', boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <SettingsRow icon={<Shield size={18} />} label="Pause all listings" sublabel="Hide all your listings from search"
                  right={<Toggle value={prefs.landlord_pause_listings} onChange={v => updatePref('landlord_pause_listings', v)} />} />
              </div>
            </motion.div>
          )}

          {/* App */}
          {activeSection === 'app' && (
            <motion.div key="app" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '0 20px', marginTop: 20, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <SettingsRow
                  icon={darkMode ? <Moon size={18} /> : <Sun size={18} />}
                  label="Dark mode"
                  sublabel={darkMode ? 'Currently on' : 'Currently off'}
                  right={<Toggle value={darkMode} onChange={handleDarkMode} />}
                />
              </div>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>
                Dark mode preference is saved locally on this device.
              </p>
            </motion.div>
          )}

          {/* About */}
          {activeSection === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '0 20px', marginTop: 20, boxShadow: '0 1px 4px rgba(0,103,71,0.06)' }}>
                <SettingsRow icon={<Mail size={18} />} label="Contact Support" sublabel="support@waverow.app" onClick={() => window.open('mailto:support@waverow.app')} />
                <SettingsRow icon={<Info size={18} />} label="Privacy Policy" onClick={() => {}} />
                <SettingsRow icon={<Info size={18} />} label="Terms of Service" onClick={() => {}} />
                <SettingsRow icon={<Info size={18} />} label="Version" right={<span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)' }}>1.0.0</span>} />
              </div>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>WaveRow</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Student Housing Marketplace · Tulane University</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 20, padding: 24, maxWidth: 340, width: '100%' }}
            >
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Delete Account?</h3>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 24px' }}>
                This will permanently delete your account, all listings, and messages. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowDeleteConfirm(false)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(0,103,71,0.06)', border: 'none', borderRadius: 12, fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={deleting}
                  style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: 12, fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer', color: 'white' }}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
