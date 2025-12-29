'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { updateProfile } from '@/features/auth/server'
import { useRouter } from 'next/navigation'

interface EditProfileFormProps {
  initialData: {
    display_name: string
    bio: string | null
    avatar_url: string | null
  }
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    display_name: initialData.display_name,
    bio: initialData.bio || '',
    avatar_url: initialData.avatar_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    if (formData.display_name.length < 2) {
      setError('Name muss mindestens 2 Zeichen lang sein')
      return
    }

    startTransition(async () => {
      try {
        await updateProfile({
          display_name: formData.display_name,
          bio: formData.bio || undefined,
          avatar_url: formData.avatar_url || undefined,
        })
        
        setSuccess(true)
        
        // Redirect after short delay
        setTimeout(() => {
          router.push('/me')
          router.refresh()
        }, 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil bearbeiten</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-md text-sm">
              Profil erfolgreich aktualisiert!
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="display_name">Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Max Mustermann"
              required
              disabled={isPending}
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Erzähl etwas über dich..."
              rows={4}
              disabled={isPending}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length} / 500 Zeichen
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
            <Input
              id="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Link zu deinem Profilbild
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/me')}
              disabled={isPending}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
