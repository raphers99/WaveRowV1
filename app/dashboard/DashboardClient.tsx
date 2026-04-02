'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { LogOut, Star, Edit2, Check, X } from 'lucide-react'
import { TabSwitcher, VerifiedBadge, VerificationBanner, VerificationModal } from '@/components/ui'
import { ListingGrid, ListingSkeleton } from '@/components/listing'
import { fetchSavedListings, fetchListings } from '@/lib/api'
import { fadeUp } from '@/lib/motion'
import type { Profile, Listing } from '@/types'

const TABS = ['My Listings', 'Saved', 'Reviews', 'Settings']

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

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onChange?.(i)} style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 2 }}>
          <Star size={18} fill={i <= value ? '#f59e0b' : 'none'} color={i <= value ? '#f59e0b' : 'rgba(0,0,0,0.2)'} />
        </button>
      ))}
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

  // Profile editing
  const [editingName, setEditingName] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [nameVal, setNameVal] = useState(profile?.name ?? email.split('@')[0])
  const [bioVal, setBioVal] = useState(profile?.bio ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Reviews
  const [reviews, setReviews] = useState<Array<{ id: string; author_id: string; rating: number; body: string; created_at: string; author_name?: string }>>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewBody, setReviewBody] = useState('')
  const [reviewListingId, setReviewListingId] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const name = nameVal
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
    if (activeTab === 'Reviews' && reviews.length === 0) {
      setLoadingReviews(true)
      const supabase = getSupabase()
      ;(async () => {
        try {
          const { data } = await supabase.from('reviews').select('*').eq('landlord_id', userId).order('created_at', { ascending: false })
          if (data) {
            const enriched = await Promise.all(data.map(async (r) => {
              const { data: p } = await supabase.from('profiles').select('name').eq('user_id', r.author_id).single()
              return { ...r, author_name: p?.name ?? 'Anonymous' }
            }))
            setReviews(enriched)
          }
        } catch {}
        setLoadingReviews(false)
      })()
    }
  }, [activeTab, userId])

  async function handleSaveName() {
    if (!nameVal.trim()) return
    setSavingProfile(true)
    await getSupabase().from('profiles').update({ name: nameVal.trim() }).eq('user_id', userId)
    setSavingProfile(false)
    setEditingName(false)
  }

  async function handleSaveBio() {
    setSavingProfile(true)
    await getSupabase().from('profiles').update({ bio: bioVal.trim() }).eq('user_id', userId)
    setSavingProfile(false)
    setEditingBio(false)
  }

  async function handleSubmitReview() {
    if (!reviewBody.trim()) return
    setSubmittingReview(true)
    await getSupabase().from('reviews').insert({
      author_id: userId,
      landlord_id: userId,
      listing_id: reviewListingId || null,
      rating: reviewRating,
      body: reviewBody.trim(),
    })
    setSubmittingReview(false)
    setShowReviewForm(false)
    setReviewBody('')
    setReviewRating(5)
    setReviews([])
    setLoadingReviews(true)
    getSupabase().from('reviews').select('*').eq('landlord_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data ?? []); setLoadingReviews(false) })
      .catch(() => setLoadingReviews(false))
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 0' }}>

        {/* Profile card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card" style={{ padding: '20px 20px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
            <Avatar name={name} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Editable name */}
              {editingName ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <input
                    value={nameVal}
                    onChange={e => setNameVal(e.target.value)}
                    autoFocus
                    style={{ flex: 1, fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', border: '1.5px solid var(--olive)', borderRadius: 8, padding: '4px 8px', outline: 'none' }}
                  />
                  <button onClick={handleSaveName} disabled={savingProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--olive)' }}><Check size={16} /></button>
                  <button onClick={() => { setEditingName(false); setNameVal(profile?.name ?? email.split('@')[0]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</h2>
                  <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}><Edit2 size={13} /></button>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {profile?.role ?? 'student'}
                </span>
                {profile?.verified && <VerifiedBadge type={profile.role === 'landlord' ? 'landlord' : 'student'} />}
              </div>
            </div>
          </div>

          {/* Editable bio */}
          <div style={{ marginBottom: profile?.role === 'landlord' && verStatus !== 'verified' ? 12 : 0 }}>
            {editingBio ? (
              <div>
                <textarea
                  value={bioVal}
                  onChange={e => setBioVal(e.target.value)}
                  autoFocus
                  rows={3}
                  placeholder="Tell others about yourself..."
                  style={{ width: '100%', fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-primary)', border: '1.5px solid var(--olive)', borderRadius: 8, padding: '8px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={handleSaveBio} disabled={savingProfile} style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 16px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => { setEditingBio(false); setBioVal(profile?.bio ?? '') }} style={{ background: 'none', border: '1px solid rgba(0,103,71,0.2)', borderRadius: 8, padding: '6px 16px', fontFamily: 'var(--font-dm-sans)', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditingBio(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: bioVal ? 'var(--text-secondary)' : 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {bioVal || 'Tap to add a bio...'}
                </p>
              </button>
            )}
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
                <EmptyState message="You haven't listed anything yet" cta="Create a Listing" onClick={() => router.push('/listings/new')} />
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
                <EmptyState message="No saved listings yet" cta="Browse Listings" onClick={() => router.push('/listings')} />
              ) : (
                <ListingGrid listings={savedListings} onCardClick={() => {}} onSave={() => {}} />
              )
            )}

            {activeTab === 'Reviews' && (
              <div>
                {loadingReviews ? (
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>Loading...</p>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <Star size={40} color="var(--text-muted)" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>No reviews yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.map(r => (
                      <div key={r.id} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{r.author_name}</span>
                          <StarRating value={r.rating} />
                        </div>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{r.body}</p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Settings' && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ marginBottom: 20 }}>
                  <p className="label-style">Email</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)', margin: '4px 0 0' }}>{email}</p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <p className="label-style">Role</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)', margin: '4px 0 0', textTransform: 'capitalize' }}>{profile?.role ?? 'student'}</p>
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
