'use client'

import { useState, useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deletePersonalEvent } from '../server'
import { Loader2 } from 'lucide-react'

interface DeletePersonalEventDialogProps {
  eventId: string | null
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeletePersonalEventDialog({ 
  eventId, 
  eventTitle, 
  open, 
  onOpenChange 
}: DeletePersonalEventDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!eventId) return

    startTransition(async () => {
      try {
        await deletePersonalEvent(eventId)
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to delete event:', error)
        // Keep dialog open on error so user can retry
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Event wirklich löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            "{eventTitle}" wird permanent gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Löschen...
              </>
            ) : (
              'Löschen'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
