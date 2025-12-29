export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          handle: string | null
          avatar_url: string | null
          last_inbox_seen_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          handle?: string | null
          avatar_url?: string | null
          last_inbox_seen_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          handle?: string | null
          avatar_url?: string | null
          last_inbox_seen_at?: string | null
          created_at?: string
        }
      }
      entities: {
        Row: {
          id: string
          type: 'professor' | 'crew' | 'business'
          name: string
          handle: string | null
          avatar_url: string | null
          cover_url: string | null
          verified: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'professor' | 'crew' | 'business'
          name: string
          handle?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          verified?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'professor' | 'crew' | 'business'
          name?: string
          handle?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          verified?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      entity_memberships: {
        Row: {
          entity_id: string
          user_id: string
          role: 'member' | 'organizer' | 'admin'
          created_at: string
        }
        Insert: {
          entity_id: string
          user_id: string
          role?: 'member' | 'organizer' | 'admin'
          created_at?: string
        }
        Update: {
          entity_id?: string
          user_id?: string
          role?: 'member' | 'organizer' | 'admin'
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          entity_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          entity_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          entity_id?: string
          created_at?: string
        }
      }
      events: {
        Row: {
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
          created_by: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          start_at: string
          end_at: string
          location_name?: string | null
          visibility?: 'public' | 'followers'
          status?: 'draft' | 'published'
          created_by?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          entity_id?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          start_at?: string
          end_at?: string
          location_name?: string | null
          visibility?: 'public' | 'followers'
          status?: 'draft' | 'published'
          created_by?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      user_calendar_items: {
        Row: {
          user_id: string
          event_id: string
          status: 'going' | 'removed'
          added_at: string
        }
        Insert: {
          user_id: string
          event_id: string
          status?: 'going' | 'removed'
          added_at?: string
        }
        Update: {
          user_id?: string
          event_id?: string
          status?: 'going' | 'removed'
          added_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_entity_organizer: {
        Args: {
          eid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      entity_type: 'professor' | 'crew' | 'business'
      membership_role: 'member' | 'organizer' | 'admin'
      event_visibility: 'public' | 'followers'
      event_status: 'draft' | 'published'
      calendar_status: 'going' | 'removed'
    }
  }
}
