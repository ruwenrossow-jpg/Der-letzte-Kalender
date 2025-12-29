'use server'

import { createClient } from '@/lib/supabase/server'
import { getPersonalEventsForDay } from '@/features/personal-events/server'
import type { PersonalEvent } from '@/features/personal-events/types'

export type CalendarItem = {
  id: string
  user_id: string
  event_id: string
  status: 'going' | 'removed'
  added_at: string
  type: 'shared'
  event: {
    id: string
    title: string
    start_at: string
    end_at: string
    location_name: string | null
    cover_image_url: string | null
    entity_id: string
    entity: {
      id: string
      name: string
      avatar_url: string | null
      verified: boolean
    }
  }
}

export type PersonalCalendarItem = {
  id: string
  user_id: string
  type: 'personal'
  event: PersonalEvent
}

export type MixedCalendarItem = CalendarItem | PersonalCalendarItem

export async function getCalendarItemsForDay(date: string | Date): Promise<MixedCalendarItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  // Fetch shared events
  const { data, error } = await supabase
    .from('user_calendar_items')
    .select(`
      *,
      event:events (
        id,
        title,
        start_at,
        end_at,
        location_name,
        cover_image_url,
        entity:entities (
          id,
          name,
          avatar_url
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'going')
    .gte('event.start_at', dayStart.toISOString())
    .lte('event.start_at', dayEnd.toISOString())
    .order('event(start_at)', { ascending: true })

  if (error) {
    throw error
  }

  // Filter out null events and add type
  const sharedEvents = (data || [])
    .filter((item: any) => item.event !== null)
    .map((item: any) => ({ ...item, type: 'shared' as const }))

  // Fetch personal events
  const personalEventsData = await getPersonalEventsForDay(new Date(date))
  const personalEvents: PersonalCalendarItem[] = personalEventsData.map(event => ({
    id: event.id,
    user_id: event.user_id,
    type: 'personal' as const,
    event: event
  }))

  // Merge and sort by start time
  const allEvents = [...sharedEvents, ...personalEvents].sort((a, b) => {
    const aStart = new Date(a.event.start_at).getTime()
    const bStart = new Date(b.event.start_at).getTime()
    return aStart - bStart
  })

  return allEvents as MixedCalendarItem[]
}

export async function checkEventConflict(eventId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // Get the event times
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('start_at, end_at')
    .eq('id', eventId)
    .single()

  if (eventError || !event) return false

  const eventTyped = event as { start_at: string; end_at: string }

  // Check for overlapping events in calendar
  const { data: conflictingItems, error } = await supabase
    .from('user_calendar_items')
    .select(`
      event_id,
      event:events!inner (start_at, end_at)
    `)
    .eq('user_id', user.id)
    .eq('status', 'going')
    .neq('event_id', eventId)

  if (error || !conflictingItems) return false

  // Check for time overlap
  const eventStart = new Date(eventTyped.start_at)
  const eventEnd = new Date(eventTyped.end_at)

  for (const item of conflictingItems as any[]) {
    // Skip if event is null (deleted) or missing required fields
    if (!item.event || !item.event.start_at || !item.event.end_at) continue
    
    const existingStart = new Date(item.event.start_at)
    const existingEnd = new Date(item.event.end_at)

    // Check if times overlap
    if (eventStart < existingEnd && eventEnd > existingStart) {
      return true // Conflict found
    }
  }

  return false // No conflicts
}

export async function getCurrentAndNextEvent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { current: null, next: null }
  }

  const now = new Date().toISOString()

  // Fetch current shared event (happening NOW)
  const { data: currentSharedData } = await supabase
    .from('user_calendar_items')
    .select(`
      *,
      event:events (
        id,
        title,
        start_at,
        end_at,
        location_name,
        cover_image_url,
        entity:entities (
          id,
          name,
          avatar_url
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'going')
    .lte('event.start_at', now)
    .gte('event.end_at', now)
    .order('event(start_at)', { ascending: true })
    .limit(1)

  // Fetch current personal event
  const { data: currentPersonalData } = await supabase
    .from('personal_events')
    .select('*')
    .eq('user_id', user.id)
    .lte('start_at', now)
    .gte('end_at', now)
    .order('start_at', { ascending: true })
    .limit(1)

  // Determine which current event to show (earliest start time)
  let current = null
  const currentShared = currentSharedData && currentSharedData.length > 0 && currentSharedData[0].event 
    ? { ...currentSharedData[0], type: 'shared' as const } 
    : null
  const currentPersonal = currentPersonalData && currentPersonalData.length > 0 
    ? { 
        id: currentPersonalData[0].id,
        user_id: currentPersonalData[0].user_id,
        type: 'personal' as const,
        event: currentPersonalData[0]
      } 
    : null

  if (currentShared && currentPersonal) {
    // Both exist, pick the one that started earlier
    const sharedStart = new Date(currentShared.event.start_at).getTime()
    const personalStart = new Date(currentPersonal.event.start_at).getTime()
    current = sharedStart <= personalStart ? currentShared : currentPersonal
  } else {
    current = currentShared || currentPersonal
  }

  // Fetch next shared event (upcoming)
  const { data: nextSharedData } = await supabase
    .from('user_calendar_items')
    .select(`
      *,
      event:events (
        id,
        title,
        start_at,
        end_at,
        location_name,
        cover_image_url,
        entity:entities (
          id,
          name,
          avatar_url
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'going')
    .gt('event.start_at', now)
    .order('event(start_at)', { ascending: true })
    .limit(1)

  // Fetch next personal event
  const { data: nextPersonalData } = await supabase
    .from('personal_events')
    .select('*')
    .eq('user_id', user.id)
    .gt('start_at', now)
    .order('start_at', { ascending: true })
    .limit(1)

  // Determine which next event to show (earliest start time)
  let next = null
  const nextShared = nextSharedData && nextSharedData.length > 0 && nextSharedData[0].event 
    ? { ...nextSharedData[0], type: 'shared' as const } 
    : null
  const nextPersonal = nextPersonalData && nextPersonalData.length > 0 
    ? { 
        id: nextPersonalData[0].id,
        user_id: nextPersonalData[0].user_id,
        type: 'personal' as const,
        event: nextPersonalData[0]
      } 
    : null

  if (nextShared && nextPersonal) {
    // Both exist, pick the one that starts earlier
    const sharedStart = new Date(nextShared.event.start_at).getTime()
    const personalStart = new Date(nextPersonal.event.start_at).getTime()
    next = sharedStart <= personalStart ? nextShared : nextPersonal
  } else {
    next = nextShared || nextPersonal
  }

  return { current, next }
}

export async function getUserStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { attendedCount: 0, followedCount: 0, createdCount: 0 }
  }

  const now = new Date().toISOString()

  // Count attended events (past events in calendar)
  const { count: attendedCount } = await supabase
    .from('user_calendar_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'going')
    .lt('event.end_at', now)

  // Count followed entities
  const { count: followedCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id)

  // Count created events (as organizer)
  const { count: createdCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  return {
    attendedCount: attendedCount || 0,
    followedCount: followedCount || 0,
    createdCount: createdCount || 0,
  }
}

export async function getPastEvents(): Promise<MixedCalendarItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const now = new Date().toISOString()

  // Fetch past shared events
  const { data: sharedData } = await supabase
    .from('user_calendar_items')
    .select(`
      *,
      event:events (
        id,
        title,
        start_at,
        end_at,
        location_name,
        cover_image_url,
        entity:entities (
          id,
          name,
          avatar_url
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'going')
    .lt('event.end_at', now)
    .order('event(end_at)', { ascending: false })
    .limit(10)

  const sharedEvents = (sharedData || [])
    .filter((item: any) => item.event !== null)
    .map((item: any) => ({ ...item, type: 'shared' as const }))

  // Fetch past personal events
  const { data: personalData } = await supabase
    .from('personal_events')
    .select('*')
    .eq('user_id', user.id)
    .lt('end_at', now)
    .order('end_at', { ascending: false })
    .limit(10)

  const personalEvents: PersonalCalendarItem[] = (personalData || []).map(event => ({
    id: event.id,
    user_id: event.user_id,
    type: 'personal' as const,
    event: event
  }))

  // Merge and sort by end time (most recent first)
  const allEvents = [...sharedEvents, ...personalEvents]
    .sort((a, b) => {
      const aEnd = new Date(a.event.end_at).getTime()
      const bEnd = new Date(b.event.end_at).getTime()
      return bEnd - aEnd
    })
    .slice(0, 10) // Limit to 10 most recent

  return allEvents as MixedCalendarItem[]
}
