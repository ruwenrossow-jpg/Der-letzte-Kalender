'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { createEvent } from '@/features/events/server'
import { useRouter } from 'next/navigation'
import type { z } from 'zod'
import type { createEventSchema } from '@/features/events/schemas'

interface Entity {
  id: string
  name: string
}

interface CreateEventFormProps {
  userEntities: Entity[]
}

export function CreateEventForm({ userEntities }: CreateEventFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    entity_id: userEntities[0]?.id || '',
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    location_name: '',
    cover_image_url: '',
    visibility: 'public' as 'public' | 'followers',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!formData.entity_id || !formData.title || !formData.start_at || !formData.end_at) {
      setError('Bitte fülle alle Pflichtfelder aus')
      return
    }

    // Validate date format and logic
    const startDate = new Date(formData.start_at)
    const endDate = new Date(formData.end_at)
    
    if (isNaN(startDate.getTime())) {
      setError('Ungültiges Startdatum')
      return
    }
    if (isNaN(endDate.getTime())) {
      setError('Ungültiges Enddatum')
      return
    }
    if (endDate <= startDate) {
      setError('Enddatum muss nach dem Startdatum liegen')
      return
    }

    startTransition(async () => {
      try {
        console.log('Submitting event:', formData)
        const result = await createEvent(formData)
        console.log('Create event result:', result)
        
        if (result.success) {
          router.push(`/entities/${formData.entity_id}`)
        } else {
          // Parse Zod validation errors if present
          let errorMsg = result.error || 'Event konnte nicht erstellt werden'
          try {
            const parsed = JSON.parse(result.error || '[]')
            if (Array.isArray(parsed) && parsed.length > 0) {
              errorMsg = parsed.map((e: any) => e.message).join(', ')
            }
          } catch {
            // Not a JSON error, use as-is
          }
          setError(errorMsg)
          console.error('Event creation failed:', result.error)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
        setError(errorMessage)
        console.error('Create event exception:', err)
      }
    })
  }

  if (userEntities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground space-y-2">
            <p className="font-semibold">Profil wird vorbereitet...</p>
            <p className="text-sm">Bitte führe zuerst die Datenbank-Migration 005 aus.</p>
            <p className="text-xs">Siehe Supabase Dashboard → SQL Editor</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Entity Selection */}
      <div className="space-y-2">
        <Label htmlFor="entity">Posten als *</Label>
        <Select
          value={formData.entity_id}
          onValueChange={(value) => setFormData({ ...formData, entity_id: value })}
          disabled={userEntities.length === 1}
        >
          <SelectTrigger id="entity">
            <SelectValue placeholder="Dein Profil" />
          </SelectTrigger>
          <SelectContent>
            {userEntities.map((entity, index) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Events werden auf deinem persönlichen Profil veröffentlicht
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="z.B. Mathematik Vorlesung"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Details zum Event..."
          rows={4}
        />
      </div>

      {/* Start Date & Time */}
      <div className="space-y-2">
        <Label htmlFor="start_at">Start *</Label>
        <Input
          id="start_at"
          type="datetime-local"
          value={formData.start_at}
          onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
          required
        />
      </div>

      {/* End Date & Time */}
      <div className="space-y-2">
        <Label htmlFor="end_at">Ende *</Label>
        <Input
          id="end_at"
          type="datetime-local"
          value={formData.end_at}
          onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
          required
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Ort</Label>
        <Input
          id="location"
          type="text"
          value={formData.location_name}
          onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
          placeholder="z.B. Hörsaal A, Hauptgebäude"
        />
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label htmlFor="cover_image">Cover Bild URL</Label>
        <Input
          id="cover_image"
          type="url"
          value={formData.cover_image_url}
          onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label htmlFor="visibility">Sichtbarkeit</Label>
        <Select
          value={formData.visibility}
          onValueChange={(value) => setFormData({ ...formData, visibility: value as 'public' | 'followers' })}
        >
          <SelectTrigger id="visibility">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Öffentlich</SelectItem>
            <SelectItem value="followers">Nur Follower</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Erstelle Event...
          </>
        ) : (
          'Event erstellen'
        )}
      </Button>
    </form>
  )
}
