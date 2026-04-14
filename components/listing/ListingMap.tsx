'use client'

import { useEffect, useRef } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

interface Props {
  lat: number
  lng: number
  address: string
}

export function ListingMap({ lat, lng, address }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (!API_KEY || !containerRef.current) return

    function initMap() {
      if (!containerRef.current || mapInstance.current) return
      const center = { lat, lng }
      const map = new google.maps.Map(containerRef.current, {
        center,
        zoom: 15,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
      })
      new google.maps.Marker({
        position: center,
        map,
        title: address,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#006747',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
        },
      })
      mapInstance.current = map
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
    document.head.appendChild(script)
  }, [lat, lng, address])

  if (!API_KEY) return null

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(0,103,71,0.08)',
        touchAction: 'none', // let Maps handle all touch events
      }}
    />
  )
}
