'use client'

import { useState, useTransition } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updatePersonalEvent } from '../server'
import type { PersonalEvent } from '../types'
import { Loader2 } from 'lucide-react'

interface EditPersonalEventSheetProps {
  event: PersonalEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPersonalEventSheet({ event, open, onOpenChange }: EditPersonalEventSheetProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    start_at: event?.start_at ? new Date(event.start_at).toISOString().slice(0, 16) : '',
    end_at: event?.end_at ? new Date(event.end_at).toISOString().slice(0, 16) : '',
    location_name: event?.location_name || '',
    notes: event?.notes || '',
  })

  // Update form when event changes
  useState(() => {
    if (event) {
      setFormData({
        title: event.title,
        start_at: new Date(event.start_at).toISOString().slice(0, 16),
        end_at: new Date(event.end_at).toISOString().slice(0, 16),
        location_name: event.location_name || '',
        notes: event.notes || '',
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!event) return
    
    if (!formData.title || !formData.start_at || !formData.end_at) {
      setError('Titel, Start- und Endzeit sind erforderlich')
      return
    }

    // Validate end is after start
    const start = new Date(formData.start_at)
    const end = new Date(formData.end_at)
    if (end <= start) {
      setError('Endzeit muss nach Startzeit liegen')
      return
    }

    startTransition(async () => {
      try {
        await updatePersonalEvent(event.id, {
          title: formData.title,
          start_at: formData.start_at,
          end_at: formData.end_at,
          location_name: formData.location_name || undefined,
          notes: formData.notes || undefined,
        })
        
        onOpenChange(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      }
    })
  }

  if (!event) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Termin bearbeiten</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="edit_title">Titel *</Label>
            <Input
              id="edit_title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="z.B. Zahnarzt, Lernen, Gym"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_start_at">Startzeit *</Label>
            <Input
              id="edit_start_at"
              type="datetime-local"
              value={formData.start_at}
              onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_end_at">Endzeit *</Label>
            <Input
              id="edit_end_at"
              type="datetime-local"
              value={formData.end_at}
              onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_location_name">Ort (optional)</Label>
            <Input
              id="edit_location_name"
              value={formData.location_name}
              onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
              placeholder="z.B. Praxis Dr. Schmidt"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_notes">Notizen (optional)</Label>
            <Textarea
              id="edit_notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Zusätzliche Informationen..."
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  )
}
