'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { addToCalendar, removeFromCalendar, checkEventConflict } from '../server'
import { Check, AlertCircle } from 'lucide-react'

interface AddToCalendarButtonProps {
  eventId: string
  initialIsInCalendar?: boolean
}

export function AddToCalendarButton({
  eventId,
  initialIsInCalendar = false,
}: AddToCalendarButtonProps) {
  const [isInCalendar, setIsInCalendar] = useState(initialIsInCalendar)
  const [showUndo, setShowUndo] = useState(false)
  const [conflictData, setConflictData] = useState<{ hasConflict: boolean; conflictingEvents: any[] }>({ 
    hasConflict: false, 
    conflictingEvents: [] 
  })
  const [isPending, startTransition] = useTransition()

  async function handleAdd() {
    // Check for conflicts first
    const conflict = await checkEventConflict(eventId)
    setConflictData(conflict)

    // Optimistic update
    setIsInCalendar(true)
    setShowUndo(true)

    startTransition(async () => {
      try {
        await addToCalendar(eventId)
        
        // Hide undo button after 5 seconds
        setTimeout(() => {
          setShowUndo(false)
        }, 5000)
      } catch (error) {
        // Revert on error
        setIsInCalendar(false)
        setShowUndo(false)
        console.error('Failed to add to calendar:', error)
      }
    })
  }

  async function handleRemove() {
    // Optimistic update
    setIsInCalendar(false)
    setShowUndo(false)
    setConflictData({ hasConflict: false, conflictingEvents: [] })

    startTransition(async () => {
      try {
        await removeFromCalendar(eventId)
      } catch (error) {
        // Revert on error
        setIsInCalendar(true)
        console.error('Failed to remove from calendar:', error)
      }
    })
  }

  if (isInCalendar && showUndo) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
            disabled
          >
            <Check className="h-5 w-5 mr-2" />
            Im Kalender
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleRemove}
            disabled={isPending}
          >
            Rückgängig
          </Button>
        </div>
        
        {conflictData.hasConflict ? (
          <Badge variant="destructive" className="w-full justify-center py-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            Konflikt mit {conflictData.conflictingEvents.length} Event(s)
          </Badge>
        ) : (
          <Badge variant="secondary" className="w-full justify-center py-1">
            <Check className="h-3 w-3 mr-1" />
            Keine Konflikte
          </Badge>
        )}
      </div>
    )
  }

  if (isInCalendar && !showUndo) {
    return (
      <Button
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
        disabled
      >
        <Check className="h-5 w-5 mr-2" />
        Im Kalender
      </Button>
    )
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleAdd}
      disabled={isPending}
    >
      {isPending ? 'Wird hinzugefügt...' : 'In Kalender eintragen'}
    </Button>
  )
}
