export type UpdateItem = {
  id: string
  event: {
    id: string
    title: string
    start_at: string
    end_at: string
    location_name: string | null
    cover_image_url: string | null
    updated_at: string
    entity: {
      id: string
      name: string
      avatar_url: string | null
      verified: boolean
    }
  }
}
