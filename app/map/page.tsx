'use client'

import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Listing } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const CENTER = { lat: 29.9401, lng: -90.1201 }

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const infoWindow = useRef<google.maps.InfoWindow | null>(null)
  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])

  // Fetch active listings
  useEffect(() => {
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
      .from('listings')
      .select('id, title, address, rent, beds, baths, lat, lng')
      .eq('status', 'ACTIVE')
      .limit(200)
      .then(({ data }) => setListings((data ?? []) as Listing[]))
  }, [])

  // Load Google Maps script then init
  useEffect(() => {
    if (!API_KEY) return

    function initMap() {
      if (!mapRef.current || mapInstance.current) return
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: CENTER,
        zoom: 15,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
      })
      infoWindow.current = new google.maps.InfoWindow()
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    script.async = true
    script.dataset.gmaps = '1'
    script.addEventListener('load', initMap)
    document.head.appendChild(script)
  }, [])

  // Place markers once map and listings are both ready
  useEffect(() => {
    if (!mapReady || !mapInstance.current || listings.length === 0) return

    const map = mapInstance.current
    const iw = infoWindow.current!
    const gc = geocoder.current!

    for (const listing of listings) {
      const addMarker = (position: google.maps.LatLngLiteral) => {
        const marker = new google.maps.Marker({
          position,
          map,
          title: listing.title ?? listing.address,
        })

        marker.addListener('click', () => {
          iw.setContent(`
            <div style="font-family:system-ui,sans-serif;padding:4px 2px;max-width:210px">
              <div style="font-weight:700;font-size:14px;color:#111;margin-bottom:4px;line-height:1.3">${listing.title ?? listing.address}</div>
              <div style="font-size:15px;color:#006747;font-weight:700;margin-bottom:2px">$${listing.rent.toLocaleString()}<span style="font-size:12px;font-weight:400">/mo</span></div>
              <div style="font-size:12px;color:#6b7280;margin-bottom:10px">${listing.beds} bed · ${listing.baths} bath</div>
              <a href="/listings/${listing.id}" style="display:block;background:#006747;color:white;text-decoration:none;padding:7px 0;border-radius:8px;font-size:13px;font-weight:600;text-align:center">View Listing</a>
            </div>
          `)
          iw.open(map, marker)
        })
      }

      if (listing.lat && listing.lng) {
        addMarker({ lat: listing.lat, lng: listing.lng })
      } else {
        gc.geocode(
          { address: `${listing.address}, New Orleans, LA` },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              addMarker(results[0].geometry.location.toJSON())
            }
          }
        )
      }
    }
  }, [mapReady, listings])

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
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,103,71,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
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
    }}>
      <div ref={mapRef} style={{ flex: 1 }} />
    </div>
  )
}
