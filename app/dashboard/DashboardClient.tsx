'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { LogOut } from 'lucide-react'
import { TabSwitcher, VerifiedBadge, VerificationBanner, VerificationModal } from '@/components/ui'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import { fetchSavedListings, fetchListings } from '@/lib/api'
import { fadeUp } from '@/lib/motion'
import type { Profile, Listing } from '@/types'

const TABS = ['My Listings', 'Saved', 'Messages', 'Settings']

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: size * 0.35, color: 'white' }}>{initials}</span>
    </div>
  )
}

export function DashboardClient({ profile, userId, email }: { profile: Profile | null; userId: string; email: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('My Listings')
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [savedListings, setSavedListings] = useState<Listing[]>([])
  const [loadingMy, setLoadingMy] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [showVerify, setShowVerify] = useState(false)

  const name = profile?.name ?? email.split('@')[0]
  const verStatus = profile?.verification_status ?? 'unverified'

  useEffect(() => {
    if (activeTab === 'My Listings' && myListings.length === 0) {
      setLoadingMy(true)
      fetchListings().then(all => {
        setMyListings(all.filter(l => l.user_id === userId))
      }).catch(() => {}).finally(() => setLoadingMy(false))
    }
    if (activeTab === 'Saved' && savedListings.length === 0) {
      setLoadingSaved(true)
      fetchSavedListings(userId).then(setSavedListings).catch(() => {}).finally(() => setLoadingSaved(false))
    }
  }, [activeTab, userId])

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 0' }}>

        {/* Profile card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card" style={{ padding: '20px 20px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <Avatar name={name} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
                  {profile?.role === 'landlord' ? 'Landlord' : 'Student'}
                </span>
                {profile?.verified && <VerifiedBadge type={profile.role === 'landlord' ? 'landlord' : 'student'} />}
              </div>
            </div>
          </div>
          {profile?.role === 'landlord' && verStatus !== 'verified' && (
            <VerificationBanner status={verStatus} onGetVerified={() => setShowVerify(true)} />
          )}
        </motion.div>

        {/* Tab switcher */}
        <div style={{ marginBottom: 16 }}>
          <TabSwitcher tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'My Listings' && (
              loadingMy ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {[1, 2].map(i => <ListingSkeleton key={i} />)}
                </div>
              ) : myListings.length === 0 ? (
                <EmptyState
                  message="You haven't listed anything yet"
                  cta="Create a Listing"
                  onClick={() => router.push('/listings/new')}
                />
              ) : (
                <ListingGrid listings={myListings} onCardClick={() => {}} onSave={() => {}} />
              )
            )}

            {activeTab === 'Saved' && (
              loadingSaved ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {[1, 2].map(i => <ListingSkeleton key={i} />)}
                </div>
              ) : savedListings.length === 0 ? (
                <EmptyState
                  message="No saved listings yet"
                  cta="Browse Listings"
                  onClick={() => router.push('/listings')}
                />
              ) : (
                <ListingGrid listings={savedListings} onCardClick={() => {}} onSave={() => {}} />
              )
            )}

            {activeTab === 'Messages' && (
              <EmptyState message="No messages yet" cta="Browse Listings" onClick={() => router.push('/listings')} />
            )}

            {activeTab === 'Settings' && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ marginBottom: 20 }}>
                  <p className="label-style">Email</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)', margin: '4px 0 0' }}>{email}</p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <p className="label-style">Role</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)', margin: '4px 0 0', textTransform: 'capitalize' }}>{profile?.role ?? 'Student'}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignOut}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#ef4444', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: 0 }}
                >
                  <LogOut size={16} />
                  Sign Out
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {showVerify && <VerificationModal userId={userId} onClose={() => setShowVerify(false)} />}
    </div>
  )
}

function EmptyState({ message, cta, onClick }: { message: string; cta: string; onClick: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>{message}</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: '11px 24px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
      >
        {cta}
      </motion.button>
    </div>
  )
}
