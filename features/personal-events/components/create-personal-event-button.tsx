'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreatePersonalEventSheet } from './create-personal-event-sheet'

export function CreatePersonalEventButton() {
  const [showCreateSheet, setShowCreateSheet] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowCreateSheet(true)}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
        aria-label="Neuer Termin"
      >
        <Plus className="h-6 w-6" />
      </button>

      <CreatePersonalEventSheet 
        open={showCreateSheet} 
        onOpenChange={setShowCreateSheet}
      />
    </>
  )
}
