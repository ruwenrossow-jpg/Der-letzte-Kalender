'use server'

import { createClient } from '@/lib/supabase/server'
import type { Entity } from './types'

export async function getEntities(): Promise<Entity[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .order('verified', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function getEntity(id: string): Promise<Entity | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function isFollowingEntity(entityId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data } = await supabase
    .from('follows')
    .select('entity_id')
    .eq('follower_id', user.id)
    .eq('entity_id', entityId)
    .single()

  return !!data
}

export async function getFollowedEntities(): Promise<Entity[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('follows')
    .select('entity_id, entities(*)')
    .eq('follower_id', user.id)

  if (error) {
    throw error
  }

  return data?.map((f: any) => f.entities).filter(Boolean) || []
}

export async function followEntity(entityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, entity_id: entityId } as any)

  if (error) {
    // Check for duplicate follow (23505 = unique constraint violation)
    if (error.code === '23505') {
      // Already following - silently succeed (idempotent operation)
      return
    }
    console.error('followEntity error:', error)
    throw new Error('Konnte der Entity nicht folgen. Bitte versuche es erneut.')
  }
}

export async function unfollowEntity(entityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('entity_id', entityId)

  if (error) {
    throw error
  }
}
