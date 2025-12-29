'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreatePersonalEventData, UpdatePersonalEventData, PersonalEvent } from './types'

export async function createPersonalEvent(data: CreatePersonalEventData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Nicht authentifiziert')
    }

    const { error } = await supabase
      .from('personal_events')
      .insert({ 
        ...data, 
        user_id: user.id 
      })

    if (error) {
      console.error('createPersonalEvent error:', error)
      throw new Error('Fehler beim Erstellen des Events')
    }

    revalidatePath('/calendar')
    return { success: true }
  } catch (error) {
    console.error('createPersonalEvent error:', error)
    throw error
  }
}

export async function updatePersonalEvent(id: string, updates: UpdatePersonalEventData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Nicht authentifiziert')
    }

    const { error } = await supabase
      .from('personal_events')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('updatePersonalEvent error:', error)
      throw new Error('Fehler beim Aktualisieren des Events')
    }

    revalidatePath('/calendar')
    return { success: true }
  } catch (error) {
    console.error('updatePersonalEvent error:', error)
    throw error
  }
}

export async function deletePersonalEvent(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Nicht authentifiziert')
    }

    const { error } = await supabase
      .from('personal_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('deletePersonalEvent error:', error)
      throw new Error('Fehler beim Löschen des Events')
    }

    revalidatePath('/calendar')
    return { success: true }
  } catch (error) {
    console.error('deletePersonalEvent error:', error)
    throw error
  }
}

export async function getPersonalEventsForDay(date: Date): Promise<PersonalEvent[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('personal_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_at', dayStart.toISOString())
      .lte('start_at', dayEnd.toISOString())
      .order('start_at', { ascending: true })

    if (error) {
      console.error('getPersonalEventsForDay error:', error)
      return []
    }

    return (data || []) as PersonalEvent[]
  } catch (error) {
    console.error('getPersonalEventsForDay error:', error)
    return []
  }
}
