import { createBrowserClient } from '@supabase/ssr'
import type { Listing, Profile, Conversation, Message, SwipeAction } from '@/types'

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type ListingFilters = {
  type?: string
  neighborhood?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
  search?: string
  is_sublease?: boolean
}

export async function fetchListings(filters?: ListingFilters): Promise<Listing[]> {
  const supabase = getClient()
  let query = supabase.from('listings').select('*').eq('status', 'ACTIVE')
  if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type)
  if (filters?.neighborhood) query = query.eq('neighborhood', filters.neighborhood)
  if (filters?.is_sublease) query = query.eq('is_sublease', true)
  if (filters?.search) query = query.or(`address.ilike.%${filters.search}%,neighborhood.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
  if (filters?.sort === 'price_asc') query = query.order('rent', { ascending: true })
  else if (filters?.sort === 'price_desc') query = query.order('rent', { ascending: false })
  else query = query.order('created_at', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Listing[]
}

export async function fetchListingById(id: string): Promise<Listing> {
  const supabase = getClient()
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()
  if (error) throw error
  return data as Listing
}

export async function saveListing(userId: string, listingId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('saved_listings').insert({ user_id: userId, listing_id: listingId })
  if (error && error.code !== '23505') throw error
}

export async function unsaveListing(userId: string, listingId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId)
  if (error) throw error
}

export async function fetchSavedListings(userId: string): Promise<Listing[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('saved_listings')
    .select('listing_id, listings(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []).map((r: Record<string, unknown>) => r.listings).filter(Boolean)) as Listing[]
}

export async function swipeAction(userId: string, id: string, direction: SwipeAction): Promise<void> {
  if (direction === 'like') await saveListing(userId, id)
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getClient()
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  return data as Profile | null
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
    .order('last_message_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Conversation[]
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Message[]
}

export async function sendMessage(senderId: string, receiverId: string, listingId: string, body: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, listing_id: listingId, body, read: false })
  if (error) throw error
}

export async function startConversation(participantOne: string, participantTwo: string, listingId: string): Promise<Conversation> {
  const supabase = getClient()
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_id', listingId)
    .or(`participant_one.eq.${participantOne},participant_two.eq.${participantOne}`)
    .single()
  if (existing) return existing as Conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({ participant_one: participantOne, participant_two: participantTwo, listing_id: listingId })
    .select()
    .single()
  if (error) throw error
  return data as Conversation
}
