import Link from 'next/link'

const NEIGHBORHOODS = [
  { name: 'Uptown', color: '#006747', avgRent: 1450, distance: '0.5 mi', listings: 24, desc: 'The most popular area for students, walkable to campus.' },
  { name: 'Carrollton', color: '#41B6E6', avgRent: 1200, distance: '1.2 mi', listings: 18, desc: 'Quiet residential streets with great local cafes.' },
  { name: 'Garden District', color: '#6B4F2A', avgRent: 1800, distance: '1.8 mi', listings: 15, desc: 'Historic architecture and charming streets.' },
  { name: 'Mid-City', color: '#2D5A3D', avgRent: 1100, distance: '2.4 mi', listings: 12, desc: 'Affordable living with easy access to the park.' },
]

export default function NeighborhoodsPage() {
  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Neighborhoods</h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>Explore the best areas for student housing.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {NEIGHBORHOODS.map(n => (
            <Link key={n.name} href={`/listings?neighborhood=${encodeURIComponent(n.name)}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: n.color, height: 80, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>{n.name}</h2>
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{n.desc}</p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>Avg ${n.avgRent.toLocaleString()}/mo</span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>{n.distance} to campus</span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--olive)', fontWeight: 600 }}>{n.listings} listings</span>
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
