'use server'

import { createClient } from '@/lib/supabase/server'
import type { UpdateItem } from './types'
import { revalidatePath } from 'next/cache'

export async function getUpdates(): Promise<UpdateItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get user's last_inbox_seen_at
  const { data: profile } = await supabase
    .from('profiles')
    .select('last_inbox_seen_at')
    .eq('id', user.id)
    .single()

  const profileTyped = profile as { last_inbox_seen_at: string | null } | null
  const lastSeenAt = profileTyped?.last_inbox_seen_at || new Date(0).toISOString()

  // Get followed entity IDs
  const { data: follows } = await supabase
    .from('follows')
    .select('entity_id')
    .eq('follower_id', user.id)

  const followedEntityIds = (follows || []).map((f: any) => f.entity_id)

  if (followedEntityIds.length === 0) return []

  // Get events from followed entities that are new/updated since last seen
  // Exclude events that user has already in calendar or dismissed
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      start_at,
      end_at,
      location_name,
      cover_image_url,
      updated_at,
      entity:entities!inner (
        id,
        name,
        avatar_url,
        verified
      )
    `)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .gte('updated_at', lastSeenAt)
    .in('entity_id', followedEntityIds)
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('getUpdates error:', error)
    return []
  }

  // Get user's calendar items
  const { data: calendarItems } = await supabase
    .from('user_calendar_items')
    .select('event_id')
    .eq('user_id', user.id)
    .eq('status', 'going')

  const calendarEventIds = new Set((calendarItems || []).map((item: any) => item.event_id))

  // Get user's dismissed updates
  const { data: dismissedUpdates } = await supabase
    .from('dismissed_updates')
    .select('event_id')
    .eq('user_id', user.id)

  const dismissedEventIds = new Set((dismissedUpdates || []).map((item: any) => item.event_id))

  // Filter out null events and events in calendar or dismissed
  return (data || [])
    .filter((event: any) => {
      if (!event || !event.start_at || !event.end_at) return false
      if (calendarEventIds.has(event.id)) return false
      if (dismissedEventIds.has(event.id)) return false
      return true
    })
    .map((event: any) => ({
      id: event.id,
      event,
    }))
}

export async function getUpdatesCount(): Promise<number> {
  const updates = await getUpdates()
  return updates.length
}

export async function markInboxSeen() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // Workaround for Supabase Update type issue
  const { error } = await (supabase
    .from('profiles')
    .update as any)({ last_inbox_seen_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('markInboxSeen error:', error)
    throw error
  }

  revalidatePath('/feed')
  revalidatePath('/calendar')
}

export async function dismissUpdate(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Nicht authentifiziert')
  }

  const { error } = await supabase
    .from('dismissed_updates')
    .insert({ 
      user_id: user.id, 
      event_id: eventId 
    })
    .select()
    .single()

  // Ignore duplicate key errors (23505 - already dismissed)
  if (error && error.code !== '23505') {
    console.error('dismissUpdate error:', error)
    throw new Error('Konnte Update nicht verwerfen')
  }

  revalidatePath('/feed')
  revalidatePath('/calendar')
}
