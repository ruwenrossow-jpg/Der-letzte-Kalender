'use client'

import { useState, useTransition } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPersonalEvent } from '../server'
import { Loader2 } from 'lucide-react'

interface CreatePersonalEventSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePersonalEventSheet({ open, onOpenChange }: CreatePersonalEventSheetProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    start_at: '',
    end_at: '',
    location_name: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
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
        await createPersonalEvent({
          title: formData.title,
          start_at: formData.start_at,
          end_at: formData.end_at,
          location_name: formData.location_name || undefined,
          notes: formData.notes || undefined,
        })
        
        // Reset form and close
        setFormData({
          title: '',
          start_at: '',
          end_at: '',
          location_name: '',
          notes: '',
        })
        onOpenChange(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Neuer persönlicher Termin</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="z.B. Zahnarzt, Lernen, Gym"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_at">Startzeit *</Label>
            <Input
              id="start_at"
              type="datetime-local"
              value={formData.start_at}
              onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_at">Endzeit *</Label>
            <Input
              id="end_at"
              type="datetime-local"
              value={formData.end_at}
              onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_name">Ort (optional)</Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
              placeholder="z.B. Praxis Dr. Schmidt"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
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
                  Erstellen...
                </>
              ) : (
                'Erstellen'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
