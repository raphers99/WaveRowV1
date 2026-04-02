import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const NEIGHBORHOOD_META: Record<string, { color: string; distance: string; desc: string }> = {
  Uptown:          { color: '#006747', distance: '0.5 mi', desc: 'The most popular area for students, walkable to campus.' },
  Carrollton:      { color: '#41B6E6', distance: '1.2 mi', desc: 'Quiet residential streets with great local cafes.' },
  'Garden District': { color: '#6B4F2A', distance: '1.8 mi', desc: 'Historic architecture and charming streets.' },
  'Mid-City':      { color: '#2D5A3D', distance: '2.4 mi', desc: 'Affordable living with easy access to the park.' },
  Freret:          { color: '#4B5563', distance: '0.8 mi', desc: 'Lively corridor with restaurants and nightlife.' },
}

async function getNeighborhoodStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('listings')
    .select('neighborhood, rent')
    .eq('status', 'ACTIVE')

  const stats: Record<string, { listings: number; totalRent: number }> = {}
  for (const row of data ?? []) {
    if (!row.neighborhood) continue
    if (!stats[row.neighborhood]) stats[row.neighborhood] = { listings: 0, totalRent: 0 }
    stats[row.neighborhood].listings++
    stats[row.neighborhood].totalRent += row.rent ?? 0
  }

  return stats
}

export const revalidate = 300 // revalidate every 5 minutes

export default async function NeighborhoodsPage() {
  const stats = await getNeighborhoodStats()

  const neighborhoods = Object.keys(NEIGHBORHOOD_META).map(name => {
    const s = stats[name] ?? { listings: 0, totalRent: 0 }
    const avgRent = s.listings > 0 ? Math.round(s.totalRent / s.listings) : null
    return { name, ...NEIGHBORHOOD_META[name], listings: s.listings, avgRent }
  })

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Neighborhoods</h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>Explore the best areas for student housing.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {neighborhoods.map(n => (
            <Link key={n.name} href={`/listings?neighborhood=${encodeURIComponent(n.name)}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: n.color, height: 80, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>{n.name}</h2>
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{n.desc}</p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {n.avgRent != null
                      ? <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>Avg ${n.avgRent.toLocaleString()}/mo</span>
                      : <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>No rent data yet</span>
                    }
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>{n.distance} to campus</span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--olive)', fontWeight: 600 }}>
                      {n.listings > 0 ? `${n.listings} listing${n.listings === 1 ? '' : 's'}` : 'No listings yet'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
