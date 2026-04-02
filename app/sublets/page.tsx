import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/types'
import { SubletClient } from './SubletClient'

export default async function SubletsPage() {
  const supabase = await createClient()
  let listings: Listing[] = []
  try {
    const { data } = await supabase.from('listings').select('*').eq('is_sublease', true).eq('status', 'ACTIVE').order('created_at', { ascending: false })
    listings = (data ?? []) as Listing[]
  } catch {}
  return <SubletClient initialListings={listings} />
}
