'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Bed, Bath, Square, MapPin, Wifi, Car, WashingMachine, Thermometer, Dog, Dumbbell, Waves, Utensils, Zap, Star, AlertTriangle, Home, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriceTag } from '@/components/listing/PriceTag'
import { SubletBadge } from '@/components/listing/SubletBadge'
import { fadeUp } from '@/lib/motion'
import { startConversation } from '@/lib/api'
import type { Listing } from '@/types'

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

function getSupabase() {
  return createClient()
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wifi': <Wifi size={14} />, 'Parking': <Car size={14} />, 'Washer/Dryer': <WashingMachine size={14} />,
  'In-unit laundry': <WashingMachine size={14} />, 'AC': <Thermometer size={14} />,
  'Pet Friendly': <Dog size={14} />, 'Gym': <Dumbbell size={14} />,
  'Pool': <Waves size={14} />, 'Dishwasher': <Utensils size={14} />, 'Utilities': <Zap size={14} />,
}

type ReviewWithAuthor = { id: string; author_id: string; rating: number; body: string; created_at: string; author_name?: string }

type ListerProfile = {
  name: string
  role: string
  avatar: string | null
}

export function ListingDetail({ listing, profile }: { listing: Listing; profile: ListerProfile | null }) {
  const router = useRouter()
  const [photoIndex, setPhotoIndex] = useState(0)
  const [contacting, setContacting] = useState(false)
  const hasPhotos = listing.photos.length > 0
  const photos = hasPhotos ? listing.photos : []

  // Reviews
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // ai_flags is not in the Listing type but may exist on real rows
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
      } catch {}
    })()
  }, [listing.user_id])

  async function handleSubmitReview() {
    if (!reviewBody.trim() || !currentUserId) return
    setSubmittingReview(true)
    const supabase = getSupabase()
    await supabase.from('reviews').insert({
      author_id: currentUserId,
      landlord_id: listing.user_id,
      listing_id: listing.id,
      rating: reviewRating,
      body: reviewBody.trim(),
    })
    const { data } = await supabase.from('profiles').select('name').eq('user_id', currentUserId).maybeSingle()
    setReviews(prev => [{ id: Date.now().toString(), author_id: currentUserId, rating: reviewRating, body: reviewBody.trim(), created_at: new Date().toISOString(), author_name: data?.name ?? 'You' }, ...prev])
    setReviewBody(''); setReviewRating(5); setShowReviewForm(false); setSubmittingReview(false)
  }

  async function handleContact() {
    setContacting(true)
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    if (session.user.id === listing.user_id) {
      setContacting(false)
      alert('This is your own listing.')
      return
    }
    try {
      const conversation = await startConversation(session.user.id, listing.user_id, listing.id)
      router.push(`/messages?conversation=${conversation.id}`)
    } catch {
      router.push('/messages')
    }
    setContacting(false)
  }

  function prev() { setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }
  function next() { setPhotoIndex(i => (i + 1) % photos.length) }

  const posterName = profile?.name ?? 'Listed by'
  const posterInitials = posterName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = profile?.role === 'landlord' ? 'Landlord' : profile?.role === 'subletter' ? 'Subletter' : 'Student'

  const staticMapUrl = MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(listing.address)}&zoom=15&size=600x200&scale=2&markers=color:0x006747%7C${encodeURIComponent(listing.address)}&key=${MAPS_KEY}`
    : null

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 120, minHeight: '100dvh', background: 'var(--surface)' }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{ position: 'fixed', top: 'calc(64px + env(safe-area-inset-top))', left: 16, zIndex: 30, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
        aria-label="Back"
      >
        <ChevronLeft size={20} color="var(--text-primary)" />
      </button>

      {/* Photo gallery */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--olive)' }}>
        {hasPhotos ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={photoIndex}
                src={photos[photoIndex]}
                alt={listing.title ?? listing.address}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </AnimatePresence>
            {photos.length > 1 && (
              <>
                <button onClick={prev} aria-label="Previous photo" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={next} aria-label="Next photo" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          // Placeholder when no photos
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Home size={48} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>No photos yet</p>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">

          {/* Title + price + badges */}
          {listing.title && (
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.25 }}>
              {listing.title}
            </h1>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <PriceTag price={listing.rent} />
            {listing.is_sublease && <SubletBadge />}
          </div>

          {/* Key details row */}
          <div style={{ display: 'flex', gap: 10, margin: '12px 0 8px', flexWrap: 'wrap' }}>
            {[
              { icon: <Bed size={15} />, label: `${listing.beds} bed${listing.beds !== 1 ? 's' : ''}` },
              { icon: <Bath size={15} />, label: `${listing.baths} bath${listing.baths !== 1 ? 's' : ''}` },
              ...(listing.sqft ? [{ icon: <Square size={15} />, label: `${listing.sqft.toLocaleString()} sqft` }] : []),
            ].map(({ icon, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid rgba(0,103,71,0.12)', borderRadius: 99, padding: '6px 14px', fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {icon}{label}
              </span>
            ))}
          </div>

          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>
            <MapPin size={14} />{listing.address}
          </p>

          {/* AI scam flags */}
          {aiFlags.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
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
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>About this place</h3>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{listing.description}</p>
            </div>
          )}

          {/* Features */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {listing.furnished && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Furnished</span>}
            {listing.pets && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Pets OK</span>}
            {listing.utilities && <span style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 13, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>Utilities Included</span>}
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Amenities</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {listing.amenities.map(a => (
                  <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'white', border: '1px solid rgba(0,103,71,0.12)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-dm-sans)' }}>
                    {AMENITY_ICONS[a] ?? null}{a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {listing.available_from && (
            <div style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid rgba(0,103,71,0.08)', marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>Available from</p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {new Date(listing.available_from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Poster / landlord info card */}
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid rgba(0,103,71,0.08)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            {profile?.avatar ? (
              <img src={profile.avatar} alt={posterName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 16, color: 'white' }}>{posterInitials}</span>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 2px' }}>{posterName}</p>
              <span style={{ display: 'inline-block', background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)' }}>
                {roleLabel}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleContact}
              disabled={contacting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0, opacity: contacting ? 0.7 : 1 }}
            >
              <MessageCircle size={14} />
              Message
            </motion.button>
          </div>

          {/* Address + static map */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>Location</h3>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              <MapPin size={14} color="var(--olive)" />{listing.address}
            </p>
            {staticMapUrl && (
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,103,71,0.08)' }}>
                <img
                  src={staticMapUrl}
                  alt={`Map of ${listing.address}`}
                  style={{ width: '100%', display: 'block' }}
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Reviews */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h3>
              {currentUserId && currentUserId !== listing.user_id && (
                <button onClick={() => setShowReviewForm(v => !v)} style={{ background: 'none', border: '1.5px solid var(--olive)', color: 'var(--olive)', borderRadius: 10, padding: '6px 14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {showReviewForm ? 'Cancel' : 'Leave a Review'}
                </button>
              )}
            </div>

            <AnimatePresence>
              {showReviewForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid rgba(0,103,71,0.1)' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                      {[1,2,3,4,5].map(i => (
                        <button key={i} onClick={() => setReviewRating(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <Star size={22} fill={i <= reviewRating ? '#f59e0b' : 'none'} color={i <= reviewRating ? '#f59e0b' : 'rgba(0,0,0,0.2)'} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewBody}
                      onChange={e => setReviewBody(e.target.value)}
                      placeholder="Share your experience with this landlord..."
                      rows={3}
                      className="input"
                      style={{ marginBottom: 10, resize: 'none' }}
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewBody.trim()}
                      style={{ background: reviewBody.trim() ? 'var(--olive)' : 'rgba(0,103,71,0.3)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: reviewBody.trim() ? 'pointer' : 'not-allowed', width: '100%' }}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {reviews.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)' }}>No reviews yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid rgba(0,103,71,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{r.author_name}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= r.rating ? '#f59e0b' : 'none'} color={i <= r.rating ? '#f59e0b' : 'rgba(0,0,0,0.15)'} />)}
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{r.body}</p>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContact}
            disabled={contacting}
            style={{ width: '100%', background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 14, padding: '15px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, cursor: 'pointer', opacity: contacting ? 0.7 : 1 }}
          >
            {contacting ? 'Opening...' : 'Contact About This Listing'}
          </motion.button>

        </motion.div>
      </div>

      {/* Sticky price bar */}
      <div style={{ position: 'fixed', bottom: 'calc(64px + env(safe-area-inset-bottom))', left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '0.5px solid rgba(0,103,71,0.1)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40 }}>
        <PriceTag price={listing.rent} />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleContact}
          disabled={contacting}
          style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: contacting ? 0.7 : 1 }}
        >
          {contacting ? 'Opening...' : 'Contact Landlord'}
        </motion.button>
      </div>
    </div>
  )
}
