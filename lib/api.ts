import { createClient } from '@/lib/supabase/client'
import type { Listing, Profile, Conversation, Message, SwipeAction } from '@/types'

function getClient() {
  return createClient()
}

export type ListingFilters = {
  type?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
  search?: string
  is_sublease?: boolean
}

export async function fetchListings(filters?: ListingFilters): Promise<Listing[]> {
  const supabase = getClient()
  const query = supabase.from('listings').select(`
    id, user_id, title, type, address, rent, beds, baths, furnished, pets, utilities, photos, is_sublease
  `).eq('status', 'ACTIVE')
  if (filters?.type && filters.type !== 'all') query.eq('type', filters.type)
  if (filters?.is_sublease) query.eq('is_sublease', true)
  if (filters?.search) query.or(`address.ilike.%${filters.search}%,neighborhood.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
  if (filters?.sort === 'price_asc') query.order('rent', { ascending: true })
  else if (filters?.sort === 'price_desc') query.order('rent', { ascending: false })
  else query.order('created_at', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Listing[]
}

export async function fetchListingById(id: string): Promise<Listing> {
  const supabase = getClient()
  const { data, error } = await supabase.from('listings')
    .select('id, user_id, title, type, address, neighborhood, lat, lng, rent, deposit, beds, baths, sqft, furnished, pets, utilities, photos, amenities, proximity_tags, description, status, is_sublease, available_from, available_to, distance_to_campus, created_at, updated_at')
    .eq('id', id).single()
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
  const { data } = await supabase.from('profiles')
    .select('id, user_id, name, avatar, bio, grad_year, student_id, phone, business_name, license_number, role, verified, created_at, verification_status, verification_type')
    .eq('user_id', userId).single()
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

export async function sendMessage(senderId: string, receiverId: string, conversationId: string, body: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, conversation_id: conversationId, body, read: false })
  if (error) throw error
  // Keep conversation preview in sync. The DB trigger (migration 002) also does this,
  // but updating here ensures the client list reflects the change immediately.
  await supabase
    .from('conversations')
    .update({ last_message: body, last_message_at: new Date().toISOString() })
    .eq('id', conversationId)
}

export async function startConversation(participantOne: string, participantTwo: string, listingId: string): Promise<Conversation> {
  const supabase = getClient()
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_id', listingId)
    .or(`and(participant_one.eq.${participantOne},participant_two.eq.${participantTwo}),and(participant_one.eq.${participantTwo},participant_two.eq.${participantOne})`)
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

export async function deleteListing(userId: string, listingId: string): Promise<void> {
  const supabase = getClient()
  // RLS logic relies on user_id inside the delete table wrapper securely
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', userId)

  if (error) throw error
}
