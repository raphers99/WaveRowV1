'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui'
import { MapPin, Bed, Bath, SquareCode, MessageCircle, LayoutList, Map as MapIcon } from 'lucide-react'
import type { Listing } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const CENTER = { lat: 29.9430, lng: -90.1175 }
const ZOOM = 15

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPriceShort(rent: number): string {
  if (rent >= 1000) {
    const k = rent / 1000
    return `$${k % 1 === 0 ? k : parseFloat(k.toFixed(1))}k`
  }
  return `$${rent}`
}

// ─── PricePillMarker ─────────────────────────────────────────────────────────

function makePillMarkerClass(onActivate: (id: string) => void) {
  return class PricePillMarker extends google.maps.OverlayView {
    private pillDiv: HTMLDivElement | null = null
    private position: google.maps.LatLng
    readonly listingId: string
    private rent: number
    private _active = false

    constructor(position: google.maps.LatLng, listingId: string, rent: number) {
      super()
      this.position = position
      this.listingId = listingId
      this.rent = rent
    }

    onAdd() {
      const pill = document.createElement('div')
      pill.textContent = formatPriceShort(this.rent)
      pill.style.cssText = [
        'position:absolute',
        'background:#006747',
        'color:#fff',
        'font-family:DM Sans,system-ui,sans-serif',
        'font-weight:700',
        'font-size:13px',
        'padding:5px 11px',
        'border-radius:20px',
        'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
        'cursor:pointer',
        'white-space:nowrap',
        'transform:translate(-50%,-50%)',
        'transition:transform 0.15s,box-shadow 0.15s,background 0.15s',
        'user-select:none',
        'z-index:1',
      ].join(';')
      pill.addEventListener('click', (e) => {
        e.stopPropagation()
        onActivate(this.listingId)
      })
      this.pillDiv = pill
      this.getPanes()!.overlayMouseTarget.appendChild(pill)
    }

    draw() {
      if (!this.pillDiv) return
      const point = this.getProjection().fromLatLngToDivPixel(this.position)
      if (!point) return
      this.pillDiv.style.left = `${point.x}px`
      this.pillDiv.style.top = `${point.y}px`
    }

    setActive(active: boolean) {
      this._active = active
      if (!this.pillDiv) return
      if (active) {
        this.pillDiv.style.background = '#004d33'
        this.pillDiv.style.transform = 'translate(-50%,-50%) scale(1.15)'
        this.pillDiv.style.boxShadow = '0 4px 16px rgba(0,103,71,0.5)'
        this.pillDiv.style.zIndex = '10'
      } else {
        this.pillDiv.style.background = '#006747'
        this.pillDiv.style.transform = 'translate(-50%,-50%) scale(1)'
        this.pillDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)'
        this.pillDiv.style.zIndex = '1'
      }
    }

    onRemove() {
      this.pillDiv?.parentNode?.removeChild(this.pillDiv)
      this.pillDiv = null
    }
  }
}

type PillMarkerInstance = InstanceType<ReturnType<typeof makePillMarkerClass>>

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  active,
  onHover,
  onLeave,
}: {
  listing: Listing
  active: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const router = useRouter()
  const photo = listing.photos?.[0]

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => router.push(`/listing?id=${listing.id}`)}
      style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        border: active ? '2px solid #006747' : '1.5px solid rgba(0,0,0,0.08)',
        boxShadow: active ? '0 4px 20px rgba(0,103,71,0.18)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'border 0.15s, box-shadow 0.15s',
        flexShrink: 0,
      }}
    >
      {/* Photo */}
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#e8e8e8', overflow: 'hidden', position: 'relative' }}>
        {photo ? (
          <img
            src={photo}
            alt={listing.title ?? listing.address}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={28} color="rgba(0,103,71,0.2)" strokeWidth={1.5} />
          </div>
        )}
        {listing.is_sublease && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(124,58,237,0.9)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, fontFamily: 'DM Sans,system-ui,sans-serif' }}>
            Sublet
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 20, color: '#006747', margin: '0 0 2px' }}>
          ${listing.rent.toLocaleString()}<span style={{ fontWeight: 500, fontSize: 13, color: '#888' }}>/mo</span>
        </p>
        <div style={{ display: 'flex', gap: 14, margin: '6px 0 8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#555' }}>
            <Bed size={13} strokeWidth={1.8} />{listing.beds} bed{listing.beds !== 1 ? 's' : ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#555' }}>
            <Bath size={13} strokeWidth={1.8} />{listing.baths} bath{listing.baths !== 1 ? 's' : ''}
          </span>
          {listing.sqft && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#555' }}>
              <SquareCode size={13} strokeWidth={1.8} />{listing.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#888', margin: '0 0 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {listing.address}
        </p>
        <button
          onClick={e => { e.stopPropagation(); router.push(`/listing?id=${listing.id}`) }}
          style={{
            width: '100%', background: '#006747', color: 'white', border: 'none',
            borderRadius: 10, padding: '10px', fontFamily: 'var(--font-dm-sans)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <MessageCircle size={14} />
          View &amp; Contact
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MapClient() {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, PillMarkerInstance>>(new Map())
  const PillMarkerClass = useRef<ReturnType<typeof makePillMarkerClass> | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const [mapReady, setMapReady] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('map')

  // Fetch listings
  useEffect(() => {
    createClient()
      .from('listings')
      .select('id, title, address, rent, beds, baths, sqft, lat, lng, photos, is_sublease')
      .eq('status', 'ACTIVE')
      .limit(200)
      .then(({ data, error }) => {
        if (error) toast.show('Could not load map listings', 'error')
        setListings((data ?? []) as Listing[])
        setLoading(false)
      })
  }, [])

  // Load Google Maps
  useEffect(() => {
    if (!API_KEY) return

    function initMap() {
      if (!mapRef.current || mapInstance.current) return
      try {
        PillMarkerClass.current = makePillMarkerClass((id) => {
          setActiveId(prev => prev === id ? null : id)
        })
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: CENTER,
          zoom: ZOOM,
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        })
        setMapReady(true)
      } catch {
        setMapError('Failed to load the map. Please refresh the page.')
      }
    }

    const win = window as Window & { google?: { maps?: unknown } }
    if (win.google?.maps) { initMap(); return }

    const existing = document.querySelector('script[data-gmaps]') as HTMLScriptElement | null
    if (existing) {
      const poll = setInterval(() => {
        if (win.google?.maps) { clearInterval(poll); initMap() }
      }, 50)
      return () => clearInterval(poll)
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    script.async = true
    script.dataset.gmaps = '1'
    script.addEventListener('load', initMap)
    script.addEventListener('error', () => setMapError('Failed to load Google Maps. Check your API key.'))
    document.head.appendChild(script)
  }, [])

  // Place markers once map + listings ready
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !PillMarkerClass.current) return
    const map = mapInstance.current
    const Marker = PillMarkerClass.current

    for (const listing of listings) {
      if (listing.lat && listing.lng) {
        const latLng = new google.maps.LatLng(listing.lat, listing.lng)
        const m = new Marker(latLng, listing.id, listing.rent)
        m.setMap(map)
        markersRef.current.set(listing.id, m)
      }
    }

    map.addListener('click', () => setActiveId(null))
    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current.clear()
    }
  }, [mapReady, listings])

  // Sync marker active state + scroll card into view
  useEffect(() => {
    markersRef.current.forEach((m, id) => m.setActive(id === activeId))
    if (activeId) {
      const el = cardRefs.current.get(activeId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }, [activeId])

  const handleHover = useCallback((id: string) => setActiveId(id), [])
  const handleLeave = useCallback(() => setActiveId(null), [])

  const TOP = 'calc(56px + env(safe-area-inset-top))'
  const BOTTOM = 'calc(64px + env(safe-area-inset-bottom))'

  if (mapError) {
    return (
      <div style={{ paddingTop: TOP, paddingBottom: BOTTOM, minHeight: '100dvh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>{mapError}</p>
          <button onClick={() => window.location.reload()} style={{ background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>
    )
  }

  if (!API_KEY) {
    return (
      <div style={{ paddingTop: TOP, paddingBottom: BOTTOM, minHeight: '100dvh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>Map unavailable</p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Add <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to .env to enable map
          </p>
        </div>
      </div>
    )
  }

  const listingsWithCoords = listings.filter(l => l.lat && l.lng)

  return (
    <div style={{
      paddingTop: TOP,
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
      overflow: 'hidden',
    }}>

      {/* ── Header bar ── */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        background: 'white',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Uptown New Orleans
          </h1>
          {!loading && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              {listingsWithCoords.length} rental{listingsWithCoords.length !== 1 ? 's' : ''} on map
            </p>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="map-mobile-toggle" style={{ display: 'none', background: 'rgba(0,0,0,0.06)', borderRadius: 99, padding: 3, gap: 2 }}>
          {(['list', 'map'] as const).map(v => (
            <button
              key={v}
              onClick={() => setMobileView(v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                background: mobileView === v ? 'white' : 'transparent',
                boxShadow: mobileView === v ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 600,
                color: mobileView === v ? 'var(--olive)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {v === 'list' ? <LayoutList size={14} /> : <MapIcon size={14} />}
              {v === 'list' ? 'List' : 'Map'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Split body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT: Listing cards */}
        <div
          className="map-list-panel"
          style={{
            width: '42%',
            overflowY: 'auto',
            padding: '16px 12px',
            paddingBottom: BOTTOM,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            borderRight: '0.5px solid rgba(0,0,0,0.08)',
          }}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,0.06)' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(90deg, #e8e8e8 25%, #d8d8d8 50%, #e8e8e8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ height: 22, width: 80, borderRadius: 6, background: '#e8e8e8', marginBottom: 8 }} />
                  <div style={{ height: 14, width: '70%', borderRadius: 6, background: '#f0f0f0' }} />
                </div>
              </div>
            ))
          ) : listingsWithCoords.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
              <MapPin size={36} color="rgba(0,103,71,0.25)" strokeWidth={1.5} />
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '12px 0 4px' }}>No listings found</p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>No listings with map coordinates yet.</p>
            </div>
          ) : (
            listings.filter(l => l.lat && l.lng).map(listing => (
              <div
                key={listing.id}
                ref={el => { if (el) cardRefs.current.set(listing.id, el); else cardRefs.current.delete(listing.id) }}
              >
                <ListingCard
                  listing={listing}
                  active={activeId === listing.id}
                  onHover={() => handleHover(listing.id)}
                  onLeave={handleLeave}
                />
              </div>
            ))
          )}
        </div>

        {/* RIGHT: Map */}
        <div
          className="map-map-panel"
          style={{ flex: 1, position: 'relative' }}
        >
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'linear-gradient(90deg, #e2e2e2 25%, #d0d0d0 50%, #e2e2e2 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite',
            }} />
          )}
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @media (max-width: 767px) {
          .map-mobile-toggle { display: flex !important; }
          .map-list-panel { display: ${mobileView === 'list' ? 'flex' : 'none'} !important; width: 100% !important; border-right: none !important; }
          .map-map-panel  { display: ${mobileView === 'map'  ? 'flex' : 'none'} !important; flex: 1 !important; }
        }
      `}</style>
    </div>
  )
}
