'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Home, Calendar, Users, ArrowRight, Calculator, MapPin } from 'lucide-react'
import { Section, SectionItem } from '@/components/ui'
import { ListingCard } from '@/components/listing'
import { staggerContainer, fadeUp } from '@/lib/motion'
import type { Listing } from '@/types'

// Shown when Supabase returns no listings — never show an empty section.
const MOCK_CARDS = [
  {
    id: 'mock-1', bgColor: '#2D5A3D',
    title: 'Spacious 2BR Near Tulane', address: '1412 Audubon St',
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

function MockCard({ card }: { card: typeof MOCK_CARDS[0] }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(0,103,71,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '4/3', background: card.bgColor, position: 'relative' }}>
        {card.isSublease && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.05em' }}>SUBLET</span>
        )}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 20, color: 'var(--olive)', margin: '0 0 6px' }}>
          ${card.rent.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)' }}>/mo</span>
        </div>
        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          {card.beds} bed · {card.baths} bath
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <MapPin size={12} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>{card.address}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {card.tags.map(tag => (
            <span key={tag} style={{ fontSize: 11, background: 'rgba(0,103,71,0.08)', color: 'var(--olive)', padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--font-dm-sans)' }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HomeClient({ featured }: { featured: Listing[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  function handleSearch() {
    if (search.trim()) router.push(`/listings?search=${encodeURIComponent(search.trim())}`)
    else router.push('/listings')
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
          {/* Tulane trust badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 99, padding: '5px 14px', marginBottom: 16 }}
          >
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.01em' }}>
              Built for Tulane students · @tulane.edu login required
            </span>
          </motion.div>

          {/* Headline — flex+gap fixes word spacing on all browsers */}
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

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{ background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '6px 6px 6px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.16)', marginBottom: 16 }}
          >
            <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by address..."
              autoComplete="off"
              autoCorrect="on"
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)', background: 'transparent', padding: '8px 12px' }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer', flexShrink: 0 }}
            >
              Search
            </motion.button>
          </motion.div>

          {/* Quick filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {['Furnished', 'Pet Friendly'].map(f => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push(`/listings?search=${encodeURIComponent(f)}`)}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontFamily: 'var(--font-dm-sans)', cursor: 'pointer', transition: 'background 0.2s' }}
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

      {/* Stats row — hardcoded, no count-up animation to avoid "0+" flash */}
      <div style={{ background: 'white', margin: '0 16px', borderRadius: 16, marginTop: -8, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,103,71,0.06)' }}>
        <div style={{ display: 'flex', overflow: 'hidden', borderRadius: 16 }}>
          {/* Active Listings */}
          <div style={{ textAlign: 'center', flex: 1, padding: '20px 12px', borderRight: '1px solid rgba(0,103,71,0.08)' }}>
            <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 30, color: 'var(--olive)' }}>47+</div>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Active Listings</div>
          </div>
          {/* Students Housed */}
          <div style={{ textAlign: 'center', flex: 1, padding: '20px 12px', borderRight: '1px solid rgba(0,103,71,0.08)' }}>
            <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 30, color: 'var(--olive)' }}>200+</div>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Students Housed</div>
          </div>
          {/* Avg. Rating */}
          <div style={{ textAlign: 'center', flex: 1, padding: '20px 12px', borderRight: '1px solid rgba(0,103,71,0.08)' }}>
            <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 30, color: 'var(--olive)' }}>4.8</div>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Avg. Rating</div>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2, opacity: 0.75 }}>from 30+ reviews</div>
          </div>
          {/* Location badge */}
          <div style={{ textAlign: 'center', flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <MapPin size={16} color="var(--olive)" />
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>Uptown<br />New Orleans</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px' }}>

        {/* Featured Listings — always shows content (mocks when no real data) */}
        <div style={{ paddingTop: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600, color: 'var(--olive)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>FRESH PICKS</p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Featured Listings</h2>
          </div>

          {featured.length === 0 ? (
            /* Mock cards — displayed until real listings load from Supabase */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {MOCK_CARDS.map(card => <MockCard key={card.id} card={card} />)}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}
            >
              {featured.map((listing, i) => (
                <motion.div key={listing.id} variants={fadeUp} custom={i}>
                  <ListingCard listing={listing} onClick={() => {}} onSave={() => {}} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
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

        {/* How It Works */}
        <Section>
          <SectionItem index={0}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, margin: '40px 0 20px', color: 'var(--text-primary)' }}>How It Works</h2>
          </SectionItem>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { icon: <Home size={22} color="var(--olive)" />, title: 'Find Housing', desc: 'Browse verified apartments near your campus.', href: '/listings', cta: 'Browse listings' },
              { icon: <Calendar size={22} color="var(--olive)" />, title: 'Short-Term Sublets', desc: 'Going abroad? Semester leases from students.', href: '/listings?sublet=true', cta: 'See sublets' },
              { icon: <Users size={22} color="var(--olive)" />, title: 'Find Roommates', desc: 'Match with students who share your budget and lifestyle.', href: '/roommates', cta: 'Find roommates' },
              { icon: <Calculator size={22} color="var(--olive)" />, title: 'Rent Calculator', desc: 'Figure out what you can afford before you browse.', href: '/tools', cta: 'Calculate budget' },
            ].map((card, i) => (
              <SectionItem key={card.title} index={i + 1}>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {card.icon}
                  </motion.div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{card.title}</h3>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                  </div>
                  <Link href={card.href} style={{ color: 'var(--olive)', fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                    {card.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </SectionItem>
            ))}
          </div>
        </Section>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          style={{ background: 'linear-gradient(135deg, var(--olive) 0%, var(--olive-dark) 100%)', borderRadius: 20, padding: '40px 24px', textAlign: 'center', margin: '40px 0 24px' }}
        >
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>List Your Place</h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>Reach hundreds of students looking for housing. Free to list.</p>
          <Link href="/listings/new" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 12, padding: '12px 28px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Create a Listing
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
