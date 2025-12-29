export type Entity = {
  id: string
  type: 'professor' | 'crew' | 'business'
  name: string
  handle: string | null
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  created_at: string
}

export type EntityWithFollowStatus = Entity & {
  isFollowing: boolean
}
