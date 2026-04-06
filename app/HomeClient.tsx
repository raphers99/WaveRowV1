'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Home, Calendar, Users, ArrowRight, Calculator } from 'lucide-react'
import { Section, SectionItem, Pill } from '@/components/ui'
import { ListingCard } from '@/components/listing'
import { ListingSkeleton } from '@/components/listing'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useCountUp } from '@/hooks/useCountUp'
import { useInViewAnimation } from '@/hooks/useInViewAnimation'
import type { Listing } from '@/types'

const QUICK_FILTERS = ['Furnished', 'Pet Friendly']

function StatItem({ label, value }: { label: string; value: number }) {
  const count = useCountUp(value)
  const { ref, isInView } = useInViewAnimation()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', flex: 1, padding: '20px 12px', borderRight: '1px solid rgba(0,103,71,0.08)' }}
    >
      <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 30, color: 'var(--olive)' }}>
        {isInView ? count : 0}{value > 10 ? '+' : ''}
      </div>
      <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </motion.div>
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
          {/* Staggered headline */}
          <motion.h1
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, fontSize: 'clamp(32px, 7vw, 56px)', color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}
          >
            {headline.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
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
            {QUICK_FILTERS.map(f => (
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

      {/* Stats */}
      <div style={{ background: 'white', margin: '0 16px', borderRadius: 16, marginTop: -8, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,103,71,0.06)' }}>
        <div style={{ display: 'flex', overflow: 'hidden', borderRadius: 16 }}>
          <StatItem label="Active Listings" value={100} />
          <StatItem label="Students Housed" value={500} />
          <div style={{ textAlign: 'center', flex: 1, padding: '20px 12px' }}>
            <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 30, color: 'var(--olive)' }}>4.8</div>
            <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Avg. Rating</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px' }}>

        {/* Featured Listings */}
        <div style={{ paddingTop: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600, color: 'var(--olive)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>FRESH PICKS</p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Featured Listings</h2>
          </div>
          {featured.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[...Array(3)].map((_, i) => <ListingSkeleton key={i} />)}
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

        {/* Feature Cards */}
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
