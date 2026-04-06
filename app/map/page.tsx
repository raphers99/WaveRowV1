'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Listing } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const CENTER = { lat: 29.9401, lng: -90.1201 }
const ZOOM = 14

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { elementType: 'geometry', stylers: [{ saturation: -30 }] },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function setPillDefault(el: HTMLElement) {
  el.style.cssText = [
    'background:#fff',
    'color:#1A3A2A',
    'font-family:var(--font-dm-sans),DM Sans,system-ui,sans-serif',
    'font-weight:600',
    'font-size:13px',
    'padding:5px 10px',
    'border-radius:20px',
    'box-shadow:0 2px 8px rgba(0,0,0,0.18)',
    'cursor:pointer',
    'white-space:nowrap',
    'transition:transform 0.15s ease,background 0.15s ease,color 0.15s ease',
    'transform:scale(1)',
    'user-select:none',
  ].join(';')
}

function setPillActive(el: HTMLElement) {
  el.style.background = '#1A3A2A'
  el.style.color = '#fff'
  el.style.transform = 'scale(1.1)'
}

// Build the ListingPopup class lazily so it never evaluates on the server
// (google.maps.OverlayView is undefined in Node.js / during SSR).
function makePopupClass() {
  return class ListingPopup extends google.maps.OverlayView {
    private div: HTMLDivElement | null = null
    private position: google.maps.LatLng
    private listing: Listing
    private onClose: () => void

    constructor(
      position: google.maps.LatLng,
      listing: Listing,
      onClose: () => void,
    ) {
      super()
      this.position = position
      this.listing = listing
      this.onClose = onClose
    }

    onAdd() {
      const div = document.createElement('div')
      div.style.cssText = [
        'position:absolute',
        'background:#fff',
        'border-radius:16px',
        'padding:16px',
        'box-shadow:0 4px 24px rgba(0,0,0,0.12)',
        'width:220px',
        'font-family:var(--font-dm-sans),DM Sans,system-ui,sans-serif',
        'cursor:default',
        'z-index:100',
        'transform:translate(-50%, calc(-100% - 18px))',
      ].join(';')

      // Close button
      const closeBtn = document.createElement('button')
      closeBtn.innerHTML = '&times;'
      closeBtn.style.cssText = [
        'position:absolute',
        'top:8px',
        'right:10px',
        'background:none',
        'border:none',
        'font-size:18px',
        'line-height:1',
        'color:#999',
        'cursor:pointer',
        'padding:0',
        'width:20px',
        'height:20px',
        'display:flex',
        'align-items:center',
        'justify-content:center',
      ].join(';')
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.onClose()
      })

      // Title
      const title = document.createElement('div')
      title.textContent = this.listing.title ?? this.listing.address
      title.style.cssText = [
        'font-weight:700',
        'font-size:15px',
        'color:#111',
        'margin-bottom:6px',
        'line-height:1.3',
        'padding-right:20px',
      ].join(';')

      // Price row
      const priceRow = document.createElement('div')
      priceRow.style.cssText = 'display:flex;align-items:baseline;gap:2px;margin-bottom:4px'
      const priceMain = document.createElement('span')
      priceMain.textContent = `$${this.listing.rent.toLocaleString()}`
      priceMain.style.cssText = 'font-weight:700;font-size:18px;color:#1A3A2A'
      const priceSuffix = document.createElement('span')
      priceSuffix.textContent = '/mo'
      priceSuffix.style.cssText = 'font-size:13px;color:#666'
      priceRow.appendChild(priceMain)
      priceRow.appendChild(priceSuffix)

      // Beds / baths
      const meta = document.createElement('div')
      meta.textContent = `${this.listing.beds} bed · ${this.listing.baths} bath`
      meta.style.cssText = 'font-size:13px;color:#666;margin-bottom:12px'

      // CTA button
      const btn = document.createElement('a')
      btn.href = `/listings/${this.listing.id}`
      btn.textContent = 'View Listing'
      btn.style.cssText = [
        'display:block',
        'background:#1A3A2A',
        'color:#fff',
        'text-decoration:none',
        'text-align:center',
        'padding:10px 0',
        'border-radius:10px',
        'font-size:14px',
        'font-weight:600',
      ].join(';')

      // Caret triangle
      const caret = document.createElement('div')
      caret.style.cssText = [
        'position:absolute',
        'bottom:-8px',
        'left:50%',
        'transform:translateX(-50%)',
        'width:0',
        'height:0',
        'border-left:9px solid transparent',
        'border-right:9px solid transparent',
        'border-top:9px solid #fff',
        'filter:drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
      ].join(';')

      div.appendChild(closeBtn)
      div.appendChild(title)
      div.appendChild(priceRow)
      div.appendChild(meta)
      div.appendChild(btn)
      div.appendChild(caret)

      google.maps.event.addDomListener(div, 'mousedown', (e: Event) => e.stopPropagation())
      google.maps.event.addDomListener(div, 'click', (e: Event) => e.stopPropagation())

      this.div = div
      this.getPanes()!.floatPane.appendChild(div)
    }

    draw() {
      if (!this.div) return
      const point = this.getProjection().fromLatLngToDivPixel(this.position)!
      this.div.style.left = `${point.x}px`
      this.div.style.top = `${point.y}px`
    }

    onRemove() {
      this.div?.parentNode?.removeChild(this.div)
      this.div = null
    }
  }
}

type PopupInstance = InstanceType<ReturnType<typeof makePopupClass>>

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const activePopup = useRef<PopupInstance | null>(null)
  const activeMarkerEl = useRef<HTMLElement | null>(null)
  const PopupClass = useRef<ReturnType<typeof makePopupClass> | null>(null)

  const [mapReady, setMapReady] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch listings
  useEffect(() => {
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
      .from('listings')
      .select('id, title, address, rent, beds, baths, lat, lng')
      .eq('status', 'ACTIVE')
      .limit(200)
      .then(({ data }) => {
        setListings((data ?? []) as Listing[])
        setLoading(false)
      })
  }, [])

  // Load Google Maps + marker library, then init
  useEffect(() => {
    if (!API_KEY) return

    async function initMap() {
      if (!mapRef.current || mapInstance.current) return

      await google.maps.importLibrary('marker')

      // Build popup class after google.maps is available
      PopupClass.current = makePopupClass()

      mapInstance.current = new google.maps.Map(mapRef.current!, {
        center: CENTER,
        zoom: ZOOM,
        mapId: 'waverow_map',
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        styles: MAP_STYLES as google.maps.MapTypeStyle[],
      })
      geocoder.current = new google.maps.Geocoder()
      setMapReady(true)
    }

    if (window.google?.maps) {
      initMap()
      return
    }

    const existing = document.querySelector('script[data-gmaps]')
    if (existing) {
      existing.addEventListener('load', initMap)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker`
    script.async = true
    script.dataset.gmaps = '1'
    script.addEventListener('load', initMap)
    document.head.appendChild(script)
  }, [])

  const closePopup = useCallback(() => {
    activePopup.current?.setMap(null)
    activePopup.current = null
    if (activeMarkerEl.current) {
      setPillDefault(activeMarkerEl.current)
      activeMarkerEl.current = null
    }
  }, [])

  // Place markers once map + listings ready
  useEffect(() => {
    if (!mapReady || !mapInstance.current || listings.length === 0) return

    const map = mapInstance.current
    const gc = geocoder.current!
    const Popup = PopupClass.current!
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = []

    function addMarker(position: google.maps.LatLngLiteral, listing: Listing) {
      const pill = document.createElement('div')
      pill.textContent = `$${listing.rent.toLocaleString()}/mo`
      setPillDefault(pill)

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: pill,
      })

      marker.addListener('click', () => {
        if (activePopup.current) closePopup()

        setPillActive(pill)
        activeMarkerEl.current = pill

        const latLng = new google.maps.LatLng(position.lat, position.lng)
        const popup = new Popup(latLng, listing, closePopup)
        popup.setMap(map)
        activePopup.current = popup
      })

      newMarkers.push(marker)
    }

    async function placeAll() {
      const { MarkerClusterer, GridAlgorithm } = await import('@googlemaps/markerclusterer')

      for (const listing of listings) {
        if (listing.lat && listing.lng) {
          addMarker({ lat: listing.lat, lng: listing.lng }, listing)
        } else {
          await new Promise<void>((resolve) => {
            gc.geocode(
              { address: `${listing.address}, New Orleans, LA` },
              (results, status) => {
                if (status === 'OK' && results?.[0]) {
                  addMarker(results[0].geometry.location.toJSON(), listing)
                }
                resolve()
              },
            )
          })
        }
      }

      new MarkerClusterer({
        map,
        markers: newMarkers,
        algorithm: new GridAlgorithm({ gridSize: 60 }),
        renderer: {
          render({ count, position }) {
            const div = document.createElement('div')
            div.textContent = String(count)
            div.style.cssText = [
              'width:36px',
              'height:36px',
              'border-radius:50%',
              'background:#1A3A2A',
              'color:#fff',
              'font-family:var(--font-dm-sans),DM Sans,system-ui,sans-serif',
              'font-weight:700',
              'font-size:13px',
              'display:flex',
              'align-items:center',
              'justify-content:center',
              'box-shadow:0 2px 8px rgba(0,0,0,0.2)',
              'cursor:pointer',
            ].join(';')

            return new google.maps.marker.AdvancedMarkerElement({
              position,
              content: div,
            })
          },
        },
      })
    }

    placeAll()
    map.addListener('click', closePopup)

    return () => { closePopup() }
  }, [mapReady, listings, closePopup])

  if (!API_KEY) {
    return (
      <div style={{
        paddingTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
        minHeight: '100dvh',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(0,103,71,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="var(--olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Map unavailable
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Add <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 }}>
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code> to .env to enable map
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
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          background: 'linear-gradient(90deg, #e2e2e2 25%, #d0d0d0 50%, #e2e2e2 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
        }} />
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
