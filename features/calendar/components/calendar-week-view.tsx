'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { de } from 'date-fns/locale'
import type { MixedCalendarItem } from '../server'

interface CalendarWeekViewProps {
  initialDate: string
  initialItems: MixedCalendarItem[]
}

export function CalendarWeekView({ initialDate, initialItems }: CalendarWeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate))
  const [items, setItems] = useState<MixedCalendarItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)

  // Initial load - fetch week data
  React.useEffect(() => {
    handleWeekChange(new Date(initialDate))
  }, [])

  async function handleWeekChange(newDate: Date) {
    setCurrentDate(newDate)
    setIsLoading(true)
    
    // Fetch items for entire week (7 days)
    const weekStart = startOfWeek(newDate, { weekStartsOn: 1 })
    
    // Fetch all 7 days in parallel
    const fetchPromises = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i)
      const dateStr = format(day, 'yyyy-MM-dd')
      return fetch(`/api/calendar/items?date=${dateStr}`)
        .then(res => res.json())
        .then(data => ({ day, items: data }))
    })
    
    const weekData = await Promise.all(fetchPromises)
    const allItems = weekData.flatMap(d => d.items)
    setItems(allItems)
    setIsLoading(false)
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  // Group events by day
  const eventsByDay = weekDays.map(day => ({
    day,
    events: items.filter(item => 
      isSameDay(new Date(item.event.start_at), day)
    )
  }))

  const weekLabel = `${format(weekStart, 'd. MMM', { locale: de })} - ${format(addDays(weekStart, 6), 'd. MMM yyyy', { locale: de })}`

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleWeekChange(subWeeks(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="font-semibold text-lg">{weekLabel}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleWeekChange(new Date())}
            className="text-xs"
          >
            Diese Woche
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleWeekChange(addWeeks(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {eventsByDay.map(({ day, events }) => {
          const isCurrentDay = isToday(day)
          const dayName = format(day, 'EEE', { locale: de })
          const dayNumber = format(day, 'd')
          
          return (
            <div key={day.toISOString()} className="min-h-[120px]">
              <Card className={`p-2 h-full ${isCurrentDay ? 'border-primary border-2' : ''}`}>
                {/* Day Header */}
                <div className="text-center mb-2">
                  <div className="text-xs text-muted-foreground uppercase">
                    {dayName}
                  </div>
                  <div className={`text-lg font-semibold ${isCurrentDay ? 'text-primary' : ''}`}>
                    {dayNumber}
                  </div>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {events.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      Keine Events
                    </div>
                  ) : (
                    events.map(item => {
                      const event = item.event
                      const isPersonal = item.type === 'personal'
                      const startTime = format(new Date(event.start_at), 'HH:mm')
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-1.5 rounded text-xs border-l-2 ${
                            isPersonal 
                              ? 'border-l-gray-400 bg-gray-50' 
                              : 'border-l-blue-500 bg-blue-50'
                          }`}
                        >
                          <div className="font-medium truncate text-[10px] leading-tight">
                            {startTime}
                          </div>
                          <div className="truncate text-[11px] leading-tight">
                            {event.title}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-l-2 border-l-blue-500 bg-blue-50"></div>
          <span>Shared Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-l-2 border-l-gray-400 bg-gray-50"></div>
          <span>Persönliche Events</span>
        </div>
      </div>
    </div>
  )
}
