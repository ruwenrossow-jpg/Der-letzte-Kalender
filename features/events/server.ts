'use server'

import { createClient } from '@/lib/supabase/server'
import type { EventWithEntity, CreateEventInput } from './types'
import { createEventSchema } from './schemas'
import { revalidatePath } from 'next/cache'

export async function getFeedEvents(): Promise<EventWithEntity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get followed entity IDs first
  const { data: follows } = await supabase
    .from('follows')
    .select('entity_id')
    .eq('follower_id', user.id)

  const followedEntityIds = (follows || []).map((f: any) => f.entity_id)

  // Get events: public OR from followed entities
  let query = supabase
    .from('events')
    .select(`
      *,
      entity:entities!inner (
        id,
        name,
        type,
        avatar_url,
        verified
      )
    `)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(50)

  // Filter: public events OR events from followed entities
  if (followedEntityIds.length > 0) {
    query = query.or(`visibility.eq.public,and(visibility.eq.followers,entity_id.in.(${followedEntityIds.join(',')}))`)
  } else {
    // No follows yet, only show public events
    query = query.eq('visibility', 'public')
  }

  const { data, error } = await query

  if (error) {
    console.error('getFeedEvents error:', error)
    return [] // Don't throw, return empty
  }

  return (data as any) || []
}

// Optimized function: Get feed events with attendee counts in a single query
export async function getFeedEventsWithAttendeeCount(): Promise<Array<EventWithEntity & { attendees_count: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get followed entity IDs first
  const { data: follows } = await supabase
    .from('follows')
    .select('entity_id')
    .eq('follower_id', user.id)

  const followedEntityIds = (follows || []).map((f: any) => f.entity_id)

  // Build visibility filter
  let visibilityFilter = 'visibility.eq.public'
  if (followedEntityIds.length > 0) {
    visibilityFilter = `visibility.eq.public,and(visibility.eq.followers,entity_id.in.(${followedEntityIds.join(',')}))`
  }

  // Get all events for the feed
  let query = supabase
    .from('events')
    .select(`
      *,
      entity:entities!inner (
        id,
        name,
        type,
        avatar_url,
        verified
      )
    `)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(50)
  
  // Apply visibility filter: show all public events + follower-only from followed entities
  if (followedEntityIds.length > 0) {
    query = query.or(visibilityFilter)
  } else {
    // No follows yet - only show public events
    query = query.eq('visibility', 'public')
  }
  
  const { data: events, error } = await query

  if (error) {
    console.error('getFeedEventsWithAttendeeCount error:', error)
    return []
  }

  if (!events || events.length === 0) return []

  // Get attendee counts for all events in a single query
  const eventIds = events.map(e => e.id)
  const { data: attendeeCounts } = await supabase
    .from('user_calendar_items')
    .select('event_id')
    .in('event_id', eventIds)
    .eq('status', 'going')

  // Count attendees per event
  const countMap = new Map<string, number>()
  if (attendeeCounts) {
    for (const item of attendeeCounts) {
      const count = countMap.get(item.event_id) || 0
      countMap.set(item.event_id, count + 1)
    }
  }

  // Combine events with their counts
  return events.map(event => ({
    ...event,
    attendees_count: countMap.get(event.id) || 0
  })) as any
}

export async function getEvent(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      entity:entities (
        id,
        name,
        type,
        avatar_url,
        verified
      )
    `)
    .eq('id', eventId)
    .single()

  if (error) {
    return null
  }

  return data as any
}

export async function getEntityEvents(entityId: string): Promise<EventWithEntity[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      entity:entities (
        id,
        name,
        type,
        avatar_url,
        verified
      )
    `)
    .eq('entity_id', entityId)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(20)

  if (error) {
    throw error
  }

  return (data as any) || []
}

export async function getAttendeesCount(eventId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('user_calendar_items')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'going')

  if (error) {
    return 0
  }

  return count || 0
}

export async function isInCalendar(eventId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('user_calendar_items')
    .select('event_id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .eq('status', 'going')
    .single()

  return !!data
}

export async function addToCalendar(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('user_calendar_items')
    .insert({
      user_id: user.id,
      event_id: eventId,
      status: 'going',
    } as any)

  if (error) {
    // Check for duplicate add (23505 = primary key violation)
    if (error.code === '23505') {
      // Already in calendar - update to 'going' if it was 'removed'
      await supabase
        .from('user_calendar_items')
        .update({ status: 'going' })
        .eq('user_id', user.id)
        .eq('event_id', eventId)
      return
    }
    console.error('addToCalendar error:', error)
    throw new Error('Event konnte nicht hinzugefügt werden. Bitte versuche es erneut.')
  }

  revalidatePath('/feed')
  revalidatePath('/calendar')
}

export async function removeFromCalendar(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('user_calendar_items')
    .delete()
    .eq('user_id', user.id)
    .eq('event_id', eventId)

  if (error) {
    throw error
  }

  revalidatePath('/feed')
  revalidatePath('/calendar')
}

export async function checkEventConflict(eventId: string): Promise<{
  hasConflict: boolean
  conflictingEvents: Array<{ id: string; title: string; start_at: string; end_at: string }>
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { hasConflict: false, conflictingEvents: [] }
  }

  // Get the event we're checking
  const { data: targetEvent } = await supabase
    .from('events')
    .select('start_at, end_at')
    .eq('id', eventId)
    .single()

  if (!targetEvent) {
    return { hasConflict: false, conflictingEvents: [] }
  }

  // Check shared events in calendar
  const { data: calendarItems } = await supabase
    .from('user_calendar_items')
    .select(`
      event:events (
        id,
        title,
        start_at,
        end_at
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'going')

  // Check personal events
  const { data: personalEvents } = await supabase
    .from('personal_events')
    .select('id, title, start_at, end_at')
    .eq('user_id', user.id)

  const allEvents = [
    ...(calendarItems || []).map((item: any) => item.event).filter(Boolean),
    ...(personalEvents || [])
  ]

  // Find conflicts (events that overlap)
  const conflicts = allEvents.filter(event => {
    const eventStart = new Date(event.start_at).getTime()
    const eventEnd = new Date(event.end_at).getTime()
    const targetStart = new Date(targetEvent.start_at).getTime()
    const targetEnd = new Date(targetEvent.end_at).getTime()

    // Check if times overlap
    return (eventStart < targetEnd && eventEnd > targetStart)
  })

  return {
    hasConflict: conflicts.length > 0,
    conflictingEvents: conflicts
  }
}

export async function getUserCreatedEvents(): Promise<EventWithEntity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      entity:entities!inner (
        id,
        name,
        type,
        avatar_url,
        verified
      )
    `)
    .eq('created_by', user.id)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data as any) || []
}

export async function createEvent(input: CreateEventInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Validate input
    const validated = createEventSchema.parse(input)

    // Check if entity exists
    const { data: entity, error: entityError } = await supabase
      .from('entities')
      .select('id, type')
      .eq('id', validated.entity_id)
      .single()

    if (entityError || !entity) {
      console.error('Entity not found:', validated.entity_id, entityError)
      return { 
        success: false, 
        error: 'Profil nicht gefunden. Bitte führe Migration 005 aus (siehe MIGRATIONS_TROUBLESHOOTING.md)' 
      }
    }

    // Check if user is allowed to create events for this entity
    // 1. User can ALWAYS create events for their own profile (entity_id = user_id)
    // 2. For other entities: Must be organizer/admin (checked via membership)
    const isOwnProfile = validated.entity_id === user.id
    
    if (!isOwnProfile) {
      // For other entities: Check membership
      // Skip this check to avoid RLS recursion - in production you'd fix the RLS policies
      console.log('Skipping membership check to avoid RLS recursion')
      // TODO: Fix entity_memberships RLS policies (see migration 006)
      // For now: Only allow events on own profile
      return { 
        success: false, 
        error: 'Momentan können nur Events auf dem eigenen Profil erstellt werden. Entity-Events kommen bald!' 
      }
    }

    // Convert datetime-local format (YYYY-MM-DDTHH:MM) to ISO timestamp
    const startDate = new Date(validated.start_at)
    const endDate = new Date(validated.end_at)
    
    // Validate dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { success: false, error: 'Ungültige Datumswerte' }
    }
    
    if (endDate <= startDate) {
      return { success: false, error: 'Enddatum muss nach Startdatum liegen' }
    }
    
    const eventData = {
      ...validated,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      created_by: user.id,
      status: 'published' as const,
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData as any)
      .select()
      .single()

    if (error) {
      console.error('createEvent DB error:', error)
      console.error('eventData:', eventData)
      return { 
        success: false, 
        error: `Failed to create event: ${error.message || 'Unknown error'}` 
      }
    }

    const dataTyped = data as { id: string }

    revalidatePath('/feed')
    revalidatePath(`/entities/${validated.entity_id}`)

    return { success: true, eventId: dataTyped.id }
  } catch (error) {
    console.error('createEvent validation error:', error)
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string, path: string[] }> }
      const errorMessage = zodError.issues.map(issue => issue.message).join(', ')
      console.error('Zod validation errors:', zodError.issues)
      return { 
        success: false, 
        error: errorMessage
      }
    }
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      return { 
        success: false, 
        error: error.message 
      }
    }
    
    return { 
      success: false, 
      error: 'Invalid input' 
    }
  }
}
