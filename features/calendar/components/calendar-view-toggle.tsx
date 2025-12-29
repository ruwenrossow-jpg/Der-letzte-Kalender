'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarDayView } from './calendar-day-view'
import { CalendarWeekView } from './calendar-week-view'
import { Calendar, Grid3x3 } from 'lucide-react'
import type { MixedCalendarItem } from '../server'

interface CalendarViewToggleProps {
  initialDate: string
  initialItems: MixedCalendarItem[]
}

export function CalendarViewToggle({ initialDate, initialItems }: CalendarViewToggleProps) {
  const [view, setView] = useState<'day' | 'week'>('day')

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-center gap-2 pb-4">
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('day')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Tag
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('week')}
          className="flex items-center gap-2"
        >
          <Grid3x3 className="h-4 w-4" />
          Woche
        </Button>
      </div>

      {/* Render Selected View */}
      {view === 'day' ? (
        <CalendarDayView initialDate={initialDate} initialItems={initialItems} />
      ) : (
        <CalendarWeekView initialDate={initialDate} initialItems={initialItems} />
      )}
    </div>
  )
}
