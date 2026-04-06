import dynamic from 'next/dynamic'

// Disable SSR on the map component entirely.
// google.maps.OverlayView and the Maps JS API are browser-only; server-rendering
// the component produces a DOM tree that the client cannot reconcile after the
// API loads, causing the insertBefore/removeChild NotFoundError.
const MapClient = dynamic(() => import('./MapClient'), { ssr: false })

export default function MapPage() {
  return <MapClient />
}
