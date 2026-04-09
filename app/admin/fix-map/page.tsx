'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export default function AdminFixMapPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  function addLog(msg: string) {
    setLogs(prev => [...prev, msg])
  }

  async function handleMassFix() {
    if (!API_KEY) {
      addLog('ERROR: Google Maps API Key is missing. Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is active.')
      return
    }

    setLoading(true)
    setLogs(['Starting Mass Geocoding Operations...'])
    
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        addLog('ERROR: You must be logged into the main app to execute this script.')
        setLoading(false)
        return
      }

      addLog(`Authenticated User Identity: Verified`)

      // RLS restricts updates to self-owned records.
      const { data: listings, error } = await supabase
        .from('listings')
        .select('id, address, title')
        .eq('user_id', sessionData.session.user.id)

      if (error) throw error
      if (!listings || listings.length === 0) {
        addLog('No listings found securely attached to this user account.')
        setLoading(false)
        return
      }

      addLog(`Total Listings Target Acquired: ${listings.length}`)

      let fixedCount = 0

      for (const item of listings) {
        const address = item.address
        addLog(`Analyzing: ${address}...`)

        const searchQuery = address.toLowerCase().includes('new orleans') 
          ? address 
          : `${address}, New Orleans, LA`

        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${API_KEY}`)
        const mapData = await res.json()

        if (mapData.results && mapData.results.length > 0) {
          const lat = mapData.results[0].geometry.location.lat
          const lng = mapData.results[0].geometry.location.lng

          const { error: updateErr } = await supabase
            .from('listings')
            .update({ lat, lng })
            .eq('id', item.id)

          if (updateErr) {
            addLog(`❌ Supabase Sync Failed: ${updateErr.message}`)
          } else {
            addLog(`✅ Recalibrated System Coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}] for [${item.title ?? address}]`)
            fixedCount++
          }
        } else {
          addLog(`❌ Google Geocoding Rejected Accuracy: ${address}`)
        }
        
        // Throttling for Geocoding API compliance
        await new Promise(r => setTimeout(r, 450))
      }

      addLog(`--- END OF OPERATIONS ---`)
      addLog(`SUCCESS: Resynchronized ${fixedCount} Database Properties!`)

    } catch (e: any) {
      addLog(`CRITICAL ERROR: ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ paddingTop: 'calc(64px + env(safe-area-inset-top))', minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ padding: '40px 24px', maxWidth: 800, margin: '0 auto', fontFamily: 'var(--font-dm-sans)' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>Terminal Node: Coordinate Resync</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
          This utility securely tunnels through your Row-Level-Permissions, extracts every property registered directly to your testing account, strips out the corrupt database math randomly injected by previous local SQL seed tests, and surgically bounces them off Google`s satellites to recalculate exact real-world latitude geometries permanent to your Supabase tables.
        </p>
        
        <button 
          onClick={handleMassFix}
          disabled={loading}
          style={{
            background: 'var(--olive)',
            color: 'white',
            padding: '14px 28px',
            borderRadius: 12,
            border: 'none',
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            marginBottom: 40,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Initializing Protocol...' : 'Re-Geocode Active Listings Database'}
        </button>

        <div style={{ background: '#111827', borderRadius: 16, padding: 24, minHeight: 200, color: '#4ade80', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, overflowX: 'auto', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
          {logs.length === 0 && <span style={{ opacity: 0.5 }}>Waiting for command line execution...</span>}
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: 4 }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
