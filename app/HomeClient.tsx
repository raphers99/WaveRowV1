'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, MapPin, ArrowRight, Shield, MessageCircle, Lock, Calendar, Users } from 'lucide-react'
import { Section, SectionItem } from '@/components/ui'
import { ListingCard } from '@/components/listing'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/types'

// Change 2: Always show 3 mock cards if Supabase returns 0
const MOCK_CARDS = [
  {
    id: 'mock-1', bgColor: '#2D5A3D',
    title: 'Spacious 2BR Near Campus', address: '1412 Audubon St',
    rent: 1_650, beds: 2, baths: 1, isSublease: false,
    tags: ['Furnished', 'Verified'],
  },
  {
    id: 'mock-2', bgColor: '#1e3a5f',
    title: 'Cozy Studio on Freret', address: '4820 Freret St',
    rent: 1_100, beds: 1, baths: 1, isSublease: false,
    tags: ['Pets OK', 'Utilities Incl.'],
  },
  {
    id: 'mock-3', bgColor: '#4B3A2A',
    title: 'Spring Sublet — 3BR House', address: '7204 Maple St',
    rent: 2_400, beds: 3, baths: 2, isSublease: true,
    tags: ['Furnished', 'Sublet'],
  },
]

/** Masks the house number in an address, e.g. "1412 Audubon St" → "14XX Audubon St" */
function maskAddress(address: string): string {
  return address.replace(/^(\d{1,2})\d+/, (_, prefix: string) => `${prefix}XX`)
}

function MockCard({ card, masked = false }: { card: typeof MOCK_CARDS[0]; masked?: boolean }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(0,103,71,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '16/9', background: card.bgColor, position: 'relative' }}>
        {card.isSublease && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99, fontFamily: 'DM Sans, system-ui, sans-serif', letterSpacing: '0.05em' }}>SUBLET</span>
        )}
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        {masked ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,103,71,0.07)', borderRadius: 99, padding: '4px 12px', marginBottom: 8 }}>
            <Lock size={11} color="var(--olive)" />
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600, color: 'var(--olive)' }}>Sign in to see price</span>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 22, color: 'var(--olive)', margin: '0 0 4px' }}>
            ${card.rent.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)' }}>/mo</span>
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px' }}>{card.title}</div>
        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          {card.beds} bed · {card.baths} bath
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <MapPin size={12} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
            {masked ? maskAddress(card.address) : card.address}
          </span>
        </div>
        {!masked && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {card.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', padding: '3px 10px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Renders a real Listing with address and price masked for unauthenticated users. */
function MaskedListingCard({ listing }: { listing: Listing }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(0,103,71,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '16/9', background: '#2D5A3D', position: 'relative' }}>
        {listing.is_sublease && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99, fontFamily: 'DM Sans, system-ui, sans-serif', letterSpacing: '0.05em' }}>SUBLET</span>
        )}
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,103,71,0.07)', borderRadius: 99, padding: '4px 12px', marginBottom: 8 }}>
          <Lock size={11} color="var(--olive)" />
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600, color: 'var(--olive)' }}>Sign in to see price</span>
        </div>
        <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {listing.title ?? 'Available Unit'}
        </div>
        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          {listing.beds} bed · {listing.baths} bath
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
            {maskAddress(listing.address)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function HomeClient({ featured }: { featured: Listing[] }) {
  const router = useRouter()
  // Remove local search state; SearchInput will own it
  // Change 4: track auth state to gate the create button
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session)
    })
  }, [])

  // Change 3: use ?q= param (listings page reads q)
  function handleSearch(val: string) {
    if (val.trim()) router.push(`/listings?q=${encodeURIComponent(val.trim())}`)
    else router.push('/listings')
  }

  // Change 4: auth-aware navigation for create listing
  function handleCreate() {
    if (isAuthenticated) router.push('/listings/new')
    else router.push('/login?next=/listings/new')
  }

  const headline = 'Student Housing, Done Right.'.split(' ')

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      {/* Hero */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg, var(--olive) 0%, var(--olive-dark) 100%)', paddingTop: 'calc(72px + env(safe-area-inset-top))', paddingBottom: 64, overflow: 'hidden' }}>
        {/* Animated grid */}
        <div className="hero-grid" style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
          <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          {/* Trust badge — in hero */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 99, padding: '5px 14px', marginBottom: 16 }}
          >
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.01em' }}>
              Built for students · @tulane.edu login required
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            style={{
              fontFamily: 'var(--font-playfair)', fontWeight: 800,
              fontSize: 'clamp(32px, 7vw, 56px)', color: 'white', lineHeight: 1.1,
              margin: '0 0 16px',
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em',
            }}
          >
            {headline.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, lineHeight: 1.6 }}
          >
            Verified apartments, sublets, and roommates — built for students.
          </motion.p>

          {/* Change 3: functional search bar → /listings?q=... */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{ background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '6px 6px 6px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.16)', marginBottom: 16 }}
          >
            <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <SearchInput
              placeholder="Search by address or neighborhood..."
              inputStyle={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)', background: 'transparent', padding: '8px 12px' }}
              onSubmit={handleSearch}
            />
          </motion.div>

          {/* Quick filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {['Furnished', 'Pet Friendly', 'Sublets'].map(f => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push(`/listings?q=${encodeURIComponent(f)}`)}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontFamily: 'var(--font-dm-sans)', cursor: 'pointer' }}
              >
                {f}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="wave-divider" style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48 Z" fill="var(--surface)" />
          </svg>
        </div>
      </div>

      {/* Change 1: Replace fake stats row with a single trust badge */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 16px 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'white', border: '1px solid rgba(0,103,71,0.12)',
            borderRadius: 99, padding: '10px 20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <Shield size={15} color="var(--olive)" strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--olive)', fontWeight: 600 }}>
            100% Verified Tulane Users · Student-Only Community
          </span>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px' }}>

        {/* Change 2: Featured Listings — larger cards, always min 3 */}
        <div style={{ paddingTop: 40 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600, color: 'var(--olive)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>FRESH PICKS</p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Featured Listings</h2>
          </div>

          {featured.length === 0 ? (
            /* Always show 3 mock cards — never an empty section */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {MOCK_CARDS.map(card => <MockCard key={card.id} card={card} masked={!isAuthenticated} />)}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
            >
              {/* Real listings — show full data only when authenticated */}
              {featured.slice(0, 3).map((listing, i) => (
                <motion.div key={listing.id} variants={fadeUp} custom={i}>
                  {isAuthenticated
                    ? <ListingCard listing={listing} isSaved={false} onClick={id => router.push(`/listings/${id}`)} onSave={() => {}} />
                    : <MaskedListingCard listing={listing} />}
                </motion.div>
              ))}
              {/* Pad with mocks if Supabase returned fewer than 3 */}
              {featured.length < 3 && MOCK_CARDS.slice(0, 3 - featured.length).map(card => (
                <MockCard key={card.id} card={card} masked={!isAuthenticated} />
              ))}
            </motion.div>
          )}

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link href="/listings" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1.5px solid var(--olive)', color: 'var(--olive)', borderRadius: 12, padding: '11px 24px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                View All Listings <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* How It Works — exactly 3 steps */}
        <Section>
          <SectionItem index={0}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 700, margin: '48px 0 24px', color: 'var(--text-primary)' }}>How It Works</h2>
          </SectionItem>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                num: '01',
                title: 'Verify with @tulane.edu',
                desc: 'Sign up in seconds using your university email. A 6-digit code is sent to your @tulane.edu address — no password required.',
                icon: <Shield size={20} color="var(--olive)" />,
              },
              {
                num: '02',
                title: 'Browse vetted Uptown listings',
                desc: 'Every property is in a student-friendly Uptown neighborhood, posted by a verified WaveRow user.',
                icon: <Search size={20} color="var(--olive)" />,
              },
              {
                num: '03',
                title: 'Securely message landlords or find roommates',
                desc: 'Message landlords or students directly through WaveRow — no middleman, no third-party apps.',
                icon: <MessageCircle size={20} color="var(--olive)" />,
              },
            ].map((step, i) => (
              <SectionItem key={step.num} index={i + 1}>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, fontSize: 13, color: 'rgba(0,103,71,0.3)', letterSpacing: '0.04em' }}>{step.num}</span>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{step.title}</h3>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              </SectionItem>
            ))}
          </div>
        </Section>

        {/* Platform Features — Short-Term Sublets + Roommate Matching */}
        <div style={{ paddingBottom: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>Platform Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              {
                icon: <Calendar size={22} color="var(--olive)" />,
                title: 'Short-Term Sublets',
                desc: 'Going abroad or leaving for the summer? Find and post semester sublets from fellow students.',
                href: '/sublets',
              },
              {
                icon: <Users size={22} color="var(--olive)" />,
                title: 'Roommate Matching',
                desc: 'Browse roommate profiles, filter by budget and lifestyle, and form groups — all in one place.',
                href: '/roommates',
              },
            ].map(feat => (
              <motion.div
                key={feat.title}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={feat.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {feat.icon}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{feat.title}</h3>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 600, color: 'var(--olive)' }}>Explore</span>
                      <ArrowRight size={13} color="var(--olive)" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Change 4: CTA Banner — auth-aware create button (not button-in-a-link) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          style={{ background: 'linear-gradient(135deg, var(--olive) 0%, var(--olive-dark) 100%)', borderRadius: 20, padding: '40px 24px', textAlign: 'center', margin: '40px 0 24px' }}
        >
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>List Your Place</h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>Reach students looking for housing. Free to list.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 12, padding: '12px 28px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
          >
            Create a Listing
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}
