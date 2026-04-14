'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin, Wifi, Car, WashingMachine, Thermometer, Dog, Dumbbell, Waves, Utensils, Zap, Star, AlertTriangle, Home, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui'
import { SubletBadge } from '@/components/listing/SubletBadge'
import { ListingMap } from '@/components/listing/ListingMap'
import { fadeUp } from '@/lib/motion'
import { startConversation, deleteListing } from '@/lib/api'
import type { Listing } from '@/types'

function getSupabase() { return createClient() }

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wifi': <Wifi size={14} />, 'Parking': <Car size={14} />, 'Washer/Dryer': <WashingMachine size={14} />,
  'In-unit laundry': <WashingMachine size={14} />, 'AC': <Thermometer size={14} />,
  'Pet Friendly': <Dog size={14} />, 'Gym': <Dumbbell size={14} />,
  'Pool': <Waves size={14} />, 'Dishwasher': <Utensils size={14} />, 'Utilities': <Zap size={14} />,
}

type ReviewWithAuthor = { id: string; author_id: string; rating: number; body: string; created_at: string; author_name?: string }
type ListerProfile = { name: string; role: string; avatar: string | null }

// ── Thin-line SVG icons for info bar ─────────────────────────────────────────

function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5" />
      <path d="M2 20v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
      <line x1="2" y1="20" x2="22" y2="20" />
      <line x1="7" y1="13" x2="7" y2="9" />
    </svg>
  )
}

function BathIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" y1="5" x2="8" y2="7" />
      <path d="M2 12h20" />
    </svg>
  )
}

function SqftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function ListingDetail({ listing, profile }: { listing: Listing; profile: ListerProfile | null }) {
  const router = useRouter()
  const [photoIndex, setPhotoIndex] = useState(0)
  const [contacting, setContacting] = useState(false)
  const hasPhotos = listing.photos.length > 0
  const photos = hasPhotos ? listing.photos : []

  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isOwner = currentUserId === listing.user_id

  const aiFlags: string[] = (listing as Listing & { ai_flags?: string[] }).ai_flags ?? []

  useEffect(() => {
    const supabase = getSupabase()
    ;(async () => {
      const { data: session } = await supabase.auth.getSession()
      if (session.session) setCurrentUserId(session.session.user.id)
      try {
        const { data } = await supabase.from('reviews').select('*').eq('landlord_id', listing.user_id).order('created_at', { ascending: false })
        if (data && data.length > 0) {
          const authorIds = [...new Set(data.map(r => r.author_id))]
          const { data: authorProfiles } = await supabase.from('profiles').select('user_id, name').in('user_id', authorIds)
          const nameMap = Object.fromEntries((authorProfiles ?? []).map(p => [p.user_id, p.name]))
          setReviews(data.map(r => ({ ...r, author_name: nameMap[r.author_id] ?? 'Anonymous' })))
        } else if (data) {
          setReviews([])
        }
      } catch {
        toast.show('Could not load reviews', 'error')
      }
    })()
  }, [listing.user_id])

  async function handleSubmitReview() {
    if (!reviewBody.trim() || !currentUserId) return
    setSubmittingReview(true)
    const supabase = getSupabase()
    const { error } = await supabase.from('reviews').insert({
      author_id: currentUserId, landlord_id: listing.user_id,
      listing_id: listing.id, rating: reviewRating, body: reviewBody.trim(),
    })
    if (error) { toast.show('Could not submit review — please try again', 'error'); setSubmittingReview(false); return }
    const { data } = await supabase.from('profiles').select('name').eq('user_id', currentUserId).maybeSingle()
    setReviews(prev => [{ id: Date.now().toString(), author_id: currentUserId, rating: reviewRating, body: reviewBody.trim(), created_at: new Date().toISOString(), author_name: data?.name ?? 'You' }, ...prev])
    setReviewBody(''); setReviewRating(5); setShowReviewForm(false); setSubmittingReview(false)
  }

  async function handleContact() {
    setContacting(true)
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    if (session.user.id === listing.user_id) { setContacting(false); alert('This is your own listing.'); return }
    try {
      const conversation = await startConversation(session.user.id, listing.user_id, listing.id)
      router.push(`/messages?conversation=${conversation.id}`)
    } catch {
      toast.show('Could not start conversation', 'error')
      router.push('/messages')
    }
    setContacting(false)
  }

  async function handleDelete() {
    if (!currentUserId || !isOwner) return
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteListing(currentUserId, listing.id)
      toast.show('Listing deleted', 'success')
      router.replace('/dashboard')
    } catch {
      toast.show('Could not delete listing', 'error')
      setDeleting(false)
    }
  }

  function prev() { setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }
  function next() { setPhotoIndex(i => (i + 1) % photos.length) }

  const posterName = profile?.name ?? 'Listed by'
  const posterInitials = posterName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = profile?.role === 'landlord' ? 'Landlord' : profile?.role === 'subletter' ? 'Subletter' : 'Student'

  // Shared CTA — rendered in sidebar (desktop) and bottom of content (mobile)
  const ctaButtons = isOwner ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push(`/listing/edit?id=${listing.id}`)}
        style={{ width: '100%', background: '#006341', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
        Edit Listing
      </motion.button>
      <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete} disabled={deleting}
        style={{ width: '100%', background: '#DC2626', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
        {deleting ? 'Deleting…' : 'Delete'}
      </motion.button>
    </div>
  ) : (
    <motion.button whileTap={{ scale: 0.97 }} onClick={handleContact} disabled={contacting}
      style={{ width: '100%', background: '#006341', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, cursor: contacting ? 'not-allowed' : 'pointer', opacity: contacting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <MessageCircle size={18} />
      {contacting ? 'Opening…' : 'Contact Landlord'}
    </motion.button>
  )

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', minHeight: '100dvh', background: '#F9F9F9' }}>
      <style>{`
        .ld-img-mobile  { display: block; }
        .ld-img-desktop { display: none; }
        .ld-layout { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto; padding: 20px 16px; }
        .ld-main { width: 100%; }
        .ld-sidebar { display: none; }
        .ld-mobile-cta { display: block; }
        @media (min-width: 1024px) {
          .ld-img-mobile  { display: none; }
          .ld-img-desktop { display: block; }
          .ld-layout { flex-direction: row; align-items: flex-start; padding: 32px 40px; gap: 32px; }
          .ld-main { flex: 0 0 65%; min-width: 0; }
          .ld-sidebar { display: block; flex: 1; min-width: 0; }
          .ld-mobile-cta { display: none; }
        }
      `}</style>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        aria-label="Back"
        style={{ position: 'fixed', top: 'calc(64px + env(safe-area-inset-top))', left: 16, zIndex: 30, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
      >
        <ChevronLeft size={20} color="#111" />
      </button>

      {/* ── MOBILE IMAGE: 4:5 carousel ── */}
      <div className="ld-img-mobile" style={{ padding: '12px 16px 0' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden', background: 'rgba(0,103,71,0.08)' }}>
          {hasPhotos ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={photoIndex}
                  src={photos[photoIndex]}
                  alt={listing.title ?? listing.address}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </AnimatePresence>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 100%)', pointerEvents: 'none' }} />
              {photos.length > 1 && (
                <>
                  <button onClick={prev} aria-label="Previous photo" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={next} aria-label="Next photo" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={18} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {photos.map((_, i) => (
                      <button key={i} onClick={() => setPhotoIndex(i)} aria-label={`Photo ${i + 1}`} style={{ width: i === photoIndex ? 20 : 6, height: 6, borderRadius: 3, background: i === photoIndex ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'width 0.2s', padding: 0 }} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Home size={40} color="rgba(0,103,71,0.3)" strokeWidth={1.5} />
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>No photos yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP IMAGE: Hero grid ── */}
      <div className="ld-img-desktop" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 40px 0' }}>
        {photos.length >= 2 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: 8, height: 480 }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', height: '100%' }}>
              <img src={photos[0]} alt={listing.title ?? listing.address}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
              {[1, 2].map(idx => (
                photos[idx] ? (
                  <div key={idx} style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}>
                    <img src={photos[idx]} alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                ) : (
                  <div key={idx} style={{ flex: 1, borderRadius: 8, background: 'rgba(0,103,71,0.06)' }} />
                )
              ))}
            </div>
          </div>
        ) : (
          <div style={{ height: 480, borderRadius: 8, overflow: 'hidden', background: 'rgba(0,103,71,0.08)', position: 'relative' }}>
            {photos.length === 1 ? (
              <img src={photos[0]} alt={listing.title ?? listing.address}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Home size={48} color="rgba(0,103,71,0.3)" strokeWidth={1.5} />
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>No photos yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MAIN LAYOUT: two columns on desktop ── */}
      <div className="ld-layout">

        {/* ── LEFT / MAIN CONTENT ── */}
        <div className="ld-main">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Title block */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: '#111', margin: '0 0 10px', lineHeight: 1.2 }}>
                {listing.title ?? listing.address}
              </h1>
              {listing.is_sublease && <div style={{ marginBottom: 10 }}><SubletBadge /></div>}
              <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#888', margin: '0 0 16px' }}>
                <MapPin size={13} />{listing.address}
              </p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#444' }}>
                  <BedIcon />{listing.beds} bed{listing.beds !== 1 ? 's' : ''}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#444' }}>
                  <BathIcon />{listing.baths} bath{listing.baths !== 1 ? 's' : ''}
                </span>
                {listing.sqft && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#444' }}>
                    <SqftIcon />{listing.sqft.toLocaleString()} sqft
                  </span>
                )}
              </div>
            </div>

            {/* AI scam flags */}
            {aiFlags.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 16, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={16} color="#d97706" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 13, color: '#92400e' }}>AI Scam Detection Flags</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {aiFlags.map((flag, i) => (
                    <li key={i} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 10px' }}>About this place</h3>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: '#555', lineHeight: 1.75, margin: 0 }}>{listing.description}</p>
              </div>
            )}

            {/* Details */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 14px' }}>Details</h3>
              {(listing.furnished || listing.pets || listing.utilities) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {listing.furnished && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: '#006341', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Furnished</span>}
                  {listing.pets && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: '#006341', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Pets OK</span>}
                  {listing.utilities && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: '#006341', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Utilities Included</span>}
                </div>
              )}
              {listing.amenities.length > 0 && (
                <div style={{ marginBottom: listing.available_from ? 16 : 0 }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Amenities</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {listing.amenities.map(a => (
                      <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: '#F9F9F9', border: '1px solid rgba(0,0,0,0.1)', color: '#555', fontSize: 13, fontFamily: 'var(--font-dm-sans)' }}>
                        {AMENITY_ICONS[a] ?? null}{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {listing.available_from && (
                <div style={{ borderTop: (listing.amenities.length > 0 || listing.furnished || listing.pets || listing.utilities) ? '0.5px solid rgba(0,0,0,0.06)' : 'none', paddingTop: listing.amenities.length > 0 ? 16 : 0 }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Available from</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>
                    {new Date(listing.available_from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Lister card */}
            <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt={posterName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#006341', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16, color: 'white' }}>{posterInitials}</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: '#111', margin: '0 0 2px' }}>{posterName}</p>
                <span style={{ display: 'inline-block', background: 'rgba(0,103,71,0.08)', color: '#006341', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)' }}>
                  {roleLabel}
                </span>
              </div>
              {!isOwner && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleContact} disabled={contacting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#006341', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0, opacity: contacting ? 0.7 : 1 }}>
                  <MessageCircle size={14} />
                  Message
                </motion.button>
              )}
            </div>

            {/* Location */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 10px' }}>Location</h3>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#555', margin: '0 0 12px' }}>
                <MapPin size={14} color="#006341" />{listing.address}
              </p>
              {listing.lat && listing.lng && (
                <ListingMap lat={listing.lat} lng={listing.lng} address={listing.address} />
              )}
            </div>

            {/* Reviews */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h3>
                {currentUserId && currentUserId !== listing.user_id && (
                  <button onClick={() => setShowReviewForm(v => !v)} style={{ background: 'none', border: '1.5px solid #006341', color: '#006341', borderRadius: 10, padding: '6px 14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {showReviewForm ? 'Cancel' : 'Leave a Review'}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ background: '#F9F9F9', borderRadius: 14, padding: 16 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                        {[1,2,3,4,5].map(i => (
                          <button key={i} onClick={() => setReviewRating(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                            <Star size={22} fill={i <= reviewRating ? '#f59e0b' : 'none'} color={i <= reviewRating ? '#f59e0b' : 'rgba(0,0,0,0.2)'} />
                          </button>
                        ))}
                      </div>
                      <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)} placeholder="Share your experience with this landlord..." rows={3} className="input" style={{ marginBottom: 10, resize: 'none' }} />
                      <button onClick={handleSubmitReview} disabled={submittingReview || !reviewBody.trim()}
                        style={{ background: reviewBody.trim() ? '#006341' : 'rgba(0,99,65,0.3)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: reviewBody.trim() ? 'pointer' : 'not-allowed', width: '100%' }}>
                        {submittingReview ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {reviews.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#999', margin: 0 }}>No reviews yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ borderRadius: 12, padding: '14px 16px', background: '#F9F9F9', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, color: '#111' }}>{r.author_name}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= r.rating ? '#f59e0b' : 'none'} color={i <= r.rating ? '#f59e0b' : 'rgba(0,0,0,0.15)'} />)}
                        </div>
                      </div>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#555', margin: 0, lineHeight: 1.6 }}>{r.body}</p>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: '#999', margin: '6px 0 0' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile-only CTA buttons (hidden on desktop via CSS) */}
            <div className="ld-mobile-cta" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
              {ctaButtons}
            </div>

          </motion.div>
        </div>

        {/* ── RIGHT SIDEBAR: sticky action card (desktop only, hidden on mobile via CSS) ── */}
        <div className="ld-sidebar">
          <div style={{ position: 'sticky', top: 24, background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 36, fontWeight: 700, color: '#006341', margin: '0 0 2px', lineHeight: 1 }}>
              ${listing.rent.toLocaleString()}
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#999', margin: '0 0 20px' }}>/month</p>
            <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 20 }}>
              {ctaButtons}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
