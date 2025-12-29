export type Event = {
  id: string
  entity_id: string
  title: string
  description: string | null
  cover_image_url: string | null
  start_at: string
  end_at: string
  location_name: string | null
  visibility: 'public' | 'followers'
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export type EventWithEntity = Event & {
  entity: {
    id: string
    name: string
    type: 'professor' | 'crew' | 'business'
    avatar_url: string | null
    verified: boolean
  }
}

export type EventWithDetails = EventWithEntity & {
  attendees_count: number
  is_in_calendar: boolean
}

export type CreateEventInput = {
  entity_id: string
  title: string
  description?: string
  cover_image_url?: string
  start_at: string
  end_at: string
  location_name?: string
  visibility: 'public' | 'followers'
}
