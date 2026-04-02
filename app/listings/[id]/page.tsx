import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/types'
import { ListingDetail } from './ListingDetail'
import { notFound } from 'next/navigation'

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return notFound()

  return <ListingDetail listing={data as Listing} />
}
