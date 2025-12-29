export type User = {
  id: string
  email?: string
}

export type Profile = {
  id: string
  display_name: string | null
  handle: string | null
  avatar_url: string | null
  last_inbox_seen_at: string | null
  created_at: string
}
