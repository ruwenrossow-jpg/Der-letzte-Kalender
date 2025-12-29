'use client'

import { useState, useTransition } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, MapPin, ChevronLeft, ChevronRight, AlertCircle, Check } from 'lucide-react'
import Link from 'next/link'
import type { UpdateItem } from '../types'
import { markInboxSeen, dismissUpdate } from '../server'
import { addToCalendar, removeFromCalendar } from '@/features/events/server'
import { checkEventConflict } from '@/features/calendar/server'

interface UpdatesSheetProps {
  updates: UpdateItem[]
  trigger: React.ReactNode
}

export function UpdatesSheet({ updates, trigger }: UpdatesSheetProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [addedEvents, setAddedEvents] = useState<Set<string>>(new Set())
  const [dismissedEvents, setDismissedEvents] = useState<Set<string>>(new Set())
  const [conflicts, setConflicts] = useState<Map<string, boolean>>(new Map())
  const [isPending, startTransition] = useTransition()

  const currentUpdate = updates[currentIndex]

  async function handleAdd(eventId: string) {
    // Check conflict
    const hasConflict = await checkEventConflict(eventId)
    setConflicts(new Map(conflicts).set(eventId, hasConflict))

    // Optimistic update
    setAddedEvents(new Set(addedEvents).add(eventId))

    startTransition(async () => {
      try {
        await addToCalendar(eventId)
      } catch (error) {
        // Revert on error
        const newSet = new Set(addedEvents)
        newSet.delete(eventId)
        setAddedEvents(newSet)
        console.error('Failed to add:', error)
      }
    })
  }

  async function handleUndo(eventId: string) {
    // Optimistic update
    const newSet = new Set(addedEvents)
    newSet.delete(eventId)
    setAddedEvents(newSet)

    const newConflicts = new Map(conflicts)
    newConflicts.delete(eventId)
    setConflicts(newConflicts)

    startTransition(async () => {
      try {
        await removeFromCalendar(eventId)
      } catch (error) {
        // Revert on error
        setAddedEvents(new Set(addedEvents).add(eventId))
        console.error('Failed to undo:', error)
      }
    })
  }

  async function handleDismiss(eventId: string) {
    // Optimistic update
    setDismissedEvents(new Set(dismissedEvents).add(eventId))

    startTransition(async () => {
      try {
        await dismissUpdate(eventId)
        
        // Move to next update or close if this was the last one
        if (currentIndex < updates.length - 1) {
          setCurrentIndex(currentIndex + 1)
        } else if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1)
        } else {
          setOpen(false)
        }
      } catch (error) {
        // Revert on error
        const newSet = new Set(dismissedEvents)
        newSet.delete(eventId)
        setDismissedEvents(newSet)
        console.error('Failed to dismiss:', error)
      }
    })
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen && open) {
      // Close sheet immediately for responsive UX
      setOpen(false)
      
      // Mark inbox as seen in background
      startTransition(async () => {
        try {
          await markInboxSeen()
        } catch (error) {
          console.error('Failed to mark inbox as seen:', error)
          // Don't reopen sheet on error - user already closed it
        }
      })
    } else {
      setOpen(newOpen)
    }
  }

  if (!updates.length) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Updates von deinen Crews</SheetTitle>
            <SheetDescription>Keine neuen Updates</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
  }

  const event = currentUpdate.event
  const startDate = new Date(event.start_at)
  const dateStr = format(startDate, 'EEEE, d. MMMM', { locale: de })
  const timeStr = format(startDate, 'HH:mm', { locale: de })
  const entityInitials = event.entity.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const isAdded = addedEvents.has(event.id)
  const hasConflict = conflicts.get(event.id) || false

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Updates von deinen Crews</SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} von {updates.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentIndex(Math.min(updates.length - 1, currentIndex + 1))}
                disabled={currentIndex === updates.length - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <SheetDescription asChild>
            <Link
              href={`/entities/${event.entity.id}`}
              className="inline-flex items-center gap-2 hover:bg-accent px-2 py-1 rounded-md transition-colors -ml-2 w-fit"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.entity.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{entityInitials}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{event.entity.name}</span>
              {event.entity.verified && (
                <Badge variant="secondary" className="text-xs py-0">
                  ✓
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                • {format(new Date(event.updated_at), 'd. MMM', { locale: de })}
              </span>
            </Link>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {event.cover_image_url && (
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
              <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h3 className="font-semibold text-xl mb-3">{event.title}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{dateStr} • {timeStr} Uhr</span>
              </div>
              {event.location_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Conflict Indicator */}
          {isAdded && (
            <Badge variant={hasConflict ? 'destructive' : 'secondary'} className="w-full justify-center py-2">
              {hasConflict ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Konflikt vorhanden
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Keine Konflikte
                </>
              )}
            </Badge>
          )}

          {/* CTA */}
          <div className="space-y-2">
            {isAdded ? (
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled>
                  <Check className="h-5 w-5 mr-2" />
                  Im Kalender
                </Button>
                <Button variant="outline" onClick={() => handleUndo(event.id)} disabled={isPending}>
                  Rückgängig
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleAdd(event.id)} 
                  disabled={isPending}
                >
                  In Kalender eintragen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDismiss(event.id)} 
                  disabled={isPending}
                  className="flex-1"
                >
                  ⨯ Verwerfen
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
            Schließen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
