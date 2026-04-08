'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui'
import type { Listing } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const CENTER = { lat: 29.9311, lng: -90.1175 }
const ZOOM = 15

// ─── Price formatting ────────────────────────────────────────────────────────

function formatPriceShort(rent: number): string {
  if (rent >= 1000) {
    const k = rent / 1000
    return `$${k % 1 === 0 ? k : parseFloat(k.toFixed(1))}k`
  }
  return `$${rent}`
}

// ─── PricePillMarker — OverlayView pill (no mapId required) ─────────────────

function makePillMarkerClass(navigate: (path: string) => void) {
  return class PricePillMarker extends google.maps.OverlayView {
    private pillDiv: HTMLDivElement | null = null
    private popupDiv: HTMLDivElement | null = null
    private position: google.maps.LatLng
    private listing: Listing
    private active = false
    private onActivate: (marker: PricePillMarker) => void

    constructor(
      position: google.maps.LatLng,
      listing: Listing,
      onActivate: (marker: PricePillMarker) => void,
    ) {
      super()
      this.position = position
      this.listing = listing
      this.onActivate = onActivate
    }

    onAdd() {
      // ── Pill ──
      const pill = document.createElement('div')
      pill.textContent = formatPriceShort(this.listing.rent)
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
        'transition:transform 0.15s,box-shadow 0.15s',
        'user-select:none',
        'z-index:1',
      ].join(';')
      pill.addEventListener('click', (e) => {
        e.stopPropagation()
        this.onActivate(this)
      })
      this.pillDiv = pill
      this.getPanes()!.overlayMouseTarget.appendChild(pill)

      // ── Popup ──
      const popup = document.createElement('div')
      popup.style.cssText = [
        'position:absolute',
        'background:#fff',
        'border-radius:16px',
        'padding:16px',
        'box-shadow:0 4px 24px rgba(0,0,0,0.15)',
        'width:220px',
        'font-family:DM Sans,system-ui,sans-serif',
        'cursor:default',
        'z-index:100',
        'transform:translate(-50%,calc(-100% - 24px))',
        'display:none',
      ].join(';')

      // Close btn
      const closeBtn = document.createElement('button')
      closeBtn.innerHTML = '&times;'
      closeBtn.style.cssText = 'position:absolute;top:8px;right:10px;background:none;border:none;font-size:20px;line-height:1;color:#999;cursor:pointer;padding:0'
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.deactivate() })

      // Title
      const title = document.createElement('div')
      title.textContent = this.listing.title ?? this.listing.address
      title.style.cssText = 'font-weight:700;font-size:15px;color:#111;margin-bottom:6px;line-height:1.3;padding-right:20px'

      // Price
      const price = document.createElement('div')
      price.style.cssText = 'font-weight:700;font-size:18px;color:#006747;margin-bottom:4px'
      price.textContent = `$${this.listing.rent.toLocaleString()}/mo`

      // Meta
      const meta = document.createElement('div')
      meta.textContent = `${this.listing.beds} bed · ${this.listing.baths} bath`
      meta.style.cssText = 'font-size:13px;color:#666;margin-bottom:12px'

      // CTA
      const btn = document.createElement('button')
      btn.textContent = 'View Listing'
      btn.style.cssText = 'display:block;width:100%;background:#006747;color:#fff;border:none;text-align:center;padding:10px 0;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer'
      btn.addEventListener('click', (e) => { e.stopPropagation(); navigate(`/listings/${this.listing.id}`) })

      // Caret
      const caret = document.createElement('div')
      caret.style.cssText = 'position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:9px solid #fff;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.08))'

      popup.appendChild(closeBtn)
      popup.appendChild(title)
      popup.appendChild(price)
      popup.appendChild(meta)
      popup.appendChild(btn)
      popup.appendChild(caret)

      google.maps.event.addDomListener(popup, 'mousedown', (e: Event) => e.stopPropagation())
      google.maps.event.addDomListener(popup, 'click', (e: Event) => e.stopPropagation())

      this.popupDiv = popup
      this.getPanes()!.floatPane.appendChild(popup)
    }

    draw() {
      if (!this.pillDiv || !this.popupDiv) return
      const point = this.getProjection().fromLatLngToDivPixel(this.position)
      if (!point) return
      this.pillDiv.style.left = `${point.x}px`
      this.pillDiv.style.top = `${point.y}px`
      this.popupDiv.style.left = `${point.x}px`
      this.popupDiv.style.top = `${point.y}px`
    }

    activate() {
      this.active = true
      if (this.pillDiv) {
        this.pillDiv.style.background = '#004d33'
        this.pillDiv.style.transform = 'translate(-50%,-50%) scale(1.12)'
        this.pillDiv.style.boxShadow = '0 4px 16px rgba(0,103,71,0.5)'
        this.pillDiv.style.zIndex = '2'
      }
      if (this.popupDiv) this.popupDiv.style.display = 'block'
    }

    deactivate() {
      this.active = false
      if (this.pillDiv) {
        this.pillDiv.style.background = '#006747'
        this.pillDiv.style.transform = 'translate(-50%,-50%) scale(1)'
        this.pillDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)'
        this.pillDiv.style.zIndex = '1'
      }
      if (this.popupDiv) this.popupDiv.style.display = 'none'
    }

    onRemove() {
      this.pillDiv?.parentNode?.removeChild(this.pillDiv)
      this.popupDiv?.parentNode?.removeChild(this.popupDiv)
      this.pillDiv = null
      this.popupDiv = null
    }
  }
}

type PillMarkerInstance = InstanceType<ReturnType<typeof makePillMarkerClass>>

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MapClient() {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const activeMarker = useRef<PillMarkerInstance | null>(null)
  const PillMarkerClass = useRef<ReturnType<typeof makePillMarkerClass> | null>(null)

  const [mapReady, setMapReady] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)

  // Fetch listings
  useEffect(() => {
    createClient()
      .from('listings')
      .select('id, title, address, rent, beds, baths, lat, lng')
      .eq('status', 'ACTIVE')
      .limit(200)
      .then(({ data, error }) => {
        if (error) toast.show('Could not load map listings', 'error')
        setListings((data ?? []) as Listing[])
        setLoading(false)
      })
  }, [])

  // Load Google Maps (no extra libraries needed — OverlayView is in core)
  useEffect(() => {
    if (!API_KEY) return

    function initMap() {
      if (!mapRef.current || mapInstance.current) return
      try {
        PillMarkerClass.current = makePillMarkerClass((path) => router.push(path))
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: CENTER,
          zoom: ZOOM,
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
          // No mapId needed — OverlayView works without it
        })
        setMapReady(true)
      } catch {
        setMapError('Failed to load the map. Please refresh the page.')
      }
    }

    if (window.google?.maps) { initMap(); return }

    const existing = document.querySelector('script[data-gmaps]')
    if (existing) { existing.addEventListener('load', initMap); return }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    script.async = true
    script.dataset.gmaps = '1'
    script.addEventListener('load', initMap)
    document.head.appendChild(script)
  }, [])

  const closeActive = useCallback(() => {
    activeMarker.current?.deactivate()
    activeMarker.current = null
  }, [])

  // Place markers once map + listings ready
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !PillMarkerClass.current) return

    const map = mapInstance.current
    const Marker = PillMarkerClass.current

    function onActivate(marker: PillMarkerInstance) {
      if (activeMarker.current && activeMarker.current !== marker) {
        activeMarker.current.deactivate()
      }
      marker.activate()
      activeMarker.current = marker
    }

    function addMarker(position: google.maps.LatLngLiteral, listing: Listing) {
      const latLng = new google.maps.LatLng(position.lat, position.lng)
      const m = new Marker(latLng, listing, onActivate)
      m.setMap(map)
    }

    // Only place listings that already have coordinates.
    // Listings without lat/lng are skipped — the Geocoding API is not enabled.
    for (const listing of listings) {
      if (listing.lat && listing.lng) {
        addMarker({ lat: listing.lat, lng: listing.lng }, listing)
      }
    }

    map.addListener('click', closeActive)

    return () => { closeActive() }
  }, [mapReady, listings, closeActive])

  if (mapError) {
    return (
      <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))', minHeight: '100dvh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
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
      <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))', minHeight: '100dvh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>Map unavailable</p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Add <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to .env to enable map
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      paddingTop: 'calc(56px + env(safe-area-inset-top))',
      paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: '#e8e8e8',
      position: 'relative',
    }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'linear-gradient(90deg, #e2e2e2 25%, #d0d0d0 50%, #e2e2e2 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
        }} />
      )}
      {!loading && listings.length === 0 && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', margin: 0 }}>No listings found in this area</p>
        </div>
      )}
      <div ref={mapRef} style={{ flex: 1 }} />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}
