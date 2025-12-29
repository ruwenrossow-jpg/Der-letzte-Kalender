export interface PersonalEvent {
  id: string
  user_id: string
  title: string
  start_at: string
  end_at: string
  location_name: string | null
  notes: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface CreatePersonalEventData {
  title: string
  start_at: string
  end_at: string
  location_name?: string
  notes?: string
  color?: string
}

export interface UpdatePersonalEventData {
  title?: string
  start_at?: string
  end_at?: string
  location_name?: string
  notes?: string
  color?: string
}
