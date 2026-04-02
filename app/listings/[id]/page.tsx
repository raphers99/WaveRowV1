import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/types'
import { ListingDetail } from './ListingDetail'
import { notFound } from 'next/navigation'

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return notFound()

  return <ListingDetail listing={data as Listing} />
}
