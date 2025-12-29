import { getProfile } from '@/features/auth/server'
import { EditProfileForm } from '@/features/auth/components/edit-profile-form'
import { PageHeader } from '@/components/ui/page-header'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)

  if (!profile) {
    redirect('/me')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Profil bearbeiten" />
      <EditProfileForm 
        initialData={{
          display_name: profile.display_name,
          bio: profile.bio || null,
          avatar_url: profile.avatar_url || null,
        }}
      />
    </div>
  )
}
