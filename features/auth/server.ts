'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { loginSchema } from './schemas'
import type { Database } from '@/types/database.types'

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  // Validate with Zod
  const result = loginSchema.safeParse({ email })
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function upsertProfile(
  profileData: Database['public']['Tables']['profiles']['Insert']
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .upsert(profileData as any) // Type workaround for Supabase client

  if (error) {
    throw error
  }
}

export async function updateProfile(data: {
  display_name?: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Nicht authentifiziert')
  }

  // Validate display_name length
  if (data.display_name !== undefined && data.display_name.length < 2) {
    throw new Error('Name muss mindestens 2 Zeichen lang sein')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(data.display_name !== undefined && { display_name: data.display_name }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
    })
    .eq('id', user.id)

  if (error) {
    console.error('updateProfile DB error:', error)
    console.error('Update data:', data)
    console.error('User ID:', user.id)
    throw new Error(`Fehler beim Aktualisieren des Profils: ${error.message || 'Unknown error'}`)
  }

  console.log('Profile updated successfully:', { user_id: user.id, data })
  
  // Cache invalidieren damit User Änderungen sofort sieht!
  revalidatePath('/me')
  revalidatePath('/me/edit')
}
