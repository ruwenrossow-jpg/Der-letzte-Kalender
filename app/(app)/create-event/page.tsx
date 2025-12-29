import { getUser } from '@/features/auth/server'
import { createClient } from '@/lib/supabase/server'
import { CreateEventForm } from '@/features/events/components/create-event-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function CreateEventPage() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()

  // 1. User's eigenes Profil als virtuelle Entity
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', user.id)
    .single()

  // 2. NUR eigenes Profil (Entity-Memberships temporär deaktiviert wegen RLS recursion)
  // TODO: Fix entity_memberships RLS und dann wieder aktivieren
  // const { data: memberships } = await supabase
  //   .from('entity_memberships')
  //   .select('entity:entities(id, name)')
  //   .eq('user_id', user.id)
  //   .in('role', ['organizer', 'admin'])

  // 3. User Profil als Entity
  const userEntities = [
    {
      id: user.id,
      name: `${profile?.display_name || 'Dein Profil'} 👤`,
    },
    // ...(memberships?.map((m: any) => m.entity).filter(Boolean) || [])
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/me" className="hover:bg-accent p-1 rounded-md">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Event erstellen</h1>
      </div>
      
      <CreateEventForm userEntities={userEntities} />
    </div>
  )
}
