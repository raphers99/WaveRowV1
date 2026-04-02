import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/types'
import { ListingsClient } from './ListingsClient'

export default async function ListingsPage() {
  const supabase = await createClient()
  let listings: Listing[] = []
  try {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
    listings = (data ?? []) as Listing[]
  } catch {}

  return <ListingsClient initialListings={listings} />
}
