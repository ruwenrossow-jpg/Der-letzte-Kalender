'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2, X } from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import type { MixedCalendarItem } from '../server'
import { EditPersonalEventSheet } from '@/features/personal-events/components/edit-personal-event-sheet'
import { DeletePersonalEventDialog } from '@/features/personal-events/components/delete-personal-event-dialog'
import type { PersonalEvent } from '@/features/personal-events/types'
import { removeFromCalendar } from '@/features/events/server'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CalendarDayViewProps {
  initialDate: string
  initialItems: MixedCalendarItem[]
}

export function CalendarDayView({ initialDate, initialItems }: CalendarDayViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate))
  const [items, setItems] = useState<MixedCalendarItem[]>(initialItems)
  const [editEvent, setEditEvent] = useState<PersonalEvent | null>(null)
  const [deleteEvent, setDeleteEvent] = useState<{ id: string; title: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleDateChange(newDate: Date) {
    setCurrentDate(newDate)
    // Fetch new items
    const dateStr = format(newDate, 'yyyy-MM-dd')
    const response = await fetch(`/api/calendar/items?date=${dateStr}`)
    const data = await response.json()
    setItems(data)
  }

  async function handleRemoveFromCalendar(eventId: string) {
    startTransition(async () => {
      try {
        await removeFromCalendar(eventId)
        // Optimistically remove from UI
        setItems(items.filter(item => item.event.id !== eventId))
      } catch (error) {
        console.error('Failed to remove from calendar:', error)
      }
    })
  }

  const dateStr = format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })
  
  // Filter and sort items
  const sortedItems = [...items].sort((a, b) => 
    new Date(a.event.start_at).getTime() - new Date(b.event.start_at).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDateChange(subDays(currentDate, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="font-semibold text-lg">{dateStr}</h2>
          {!isToday(currentDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateChange(new Date())}
              className="text-xs"
            >
              Heute
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDateChange(addDays(currentDate, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Events List */}
      {sortedItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine Termine an diesem Tag</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => {
            const event = item.event
            const isPersonal = item.type === 'personal'
            
            const startTime = format(new Date(event.start_at), 'HH:mm', { locale: de })
            const endTime = format(new Date(event.end_at), 'HH:mm', { locale: de })

            return (
              <Card 
                key={item.id} 
                className={`hover:bg-accent/50 transition-colors ${
                  isPersonal ? 'border-l-4 border-l-gray-400' : 'border-l-4 border-l-blue-500'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Time */}
                    <div className="flex flex-col items-center justify-start min-w-[60px] pt-1">
                      <span className="text-sm font-medium">{startTime}</span>
                      <span className="text-xs text-muted-foreground">–</span>
                      <span className="text-xs text-muted-foreground">{endTime}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          {isPersonal ? (
                            <Badge variant="outline" className="text-xs">🔒 Privat</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">👥 Shared</Badge>
                          )}
                        </div>
                        
                        {!isPersonal && 'entity' in event && (
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={event.entity.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {event.entity.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {event.entity.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {event.location_name && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{event.location_name}</span>
                        </div>
                      )}
                      
                      {'notes' in event && event.notes && (
                        <p className="text-xs text-muted-foreground italic">{event.notes}</p>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isPersonal ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  if (item.type === 'personal') {
                                    setEditEvent(item.event)
                                  }
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteEvent({ id: item.id, title: event.title })}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleRemoveFromCalendar(item.event.id)}
                              disabled={isPending}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Aus Kalender entfernen
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Sheet */}
      <EditPersonalEventSheet
        event={editEvent}
        open={!!editEvent}
        onOpenChange={(open) => {
          if (!open) setEditEvent(null)
        }}
      />

      {/* Delete Dialog */}
      <DeletePersonalEventDialog
        eventId={deleteEvent?.id || null}
        eventTitle={deleteEvent?.title || ''}
        open={!!deleteEvent}
        onOpenChange={(open) => {
          if (!open) setDeleteEvent(null)
        }}
      />
    </div>
  )
}
