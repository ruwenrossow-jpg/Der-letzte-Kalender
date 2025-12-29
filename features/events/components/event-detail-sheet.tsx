'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, MapPin, Users, X } from 'lucide-react'
import Link from 'next/link'
import type { EventWithEntity } from '../types'
import { AddToCalendarButton } from './add-to-calendar-button'

interface EventDetailSheetProps {
  event: EventWithEntity
  attendeesCount?: number
  trigger: React.ReactNode
  initialIsInCalendar?: boolean  // Pass from parent Server Component
}

export function EventDetailSheet({
  event,
  attendeesCount = 0,
  trigger,
  initialIsInCalendar = false,
}: EventDetailSheetProps) {
  const startDate = new Date(event.start_at)
  const endDate = new Date(event.end_at)
  const dateStr = format(startDate, 'EEEE, d. MMMM yyyy', { locale: de })
  const timeStr = `${format(startDate, 'HH:mm', { locale: de })} - ${format(endDate, 'HH:mm', { locale: de })}`

  const entityInitials = event.entity.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl">{event.title}</SheetTitle>
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
            </Link>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Hero Image */}
          {event.cover_image_url && (
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Info Rows */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{dateStr}</p>
                <p className="text-sm text-muted-foreground">{timeStr} Uhr</p>
              </div>
            </div>

            {event.location_name && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{event.location_name}</p>
                </div>
              </div>
            )}

            {attendeesCount > 0 && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{attendeesCount} Teilnehmer</p>
                  <p className="text-sm text-muted-foreground">gehen zu diesem Event</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold mb-2">Beschreibung</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Action Pills (Stubs for P0) */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled>
              Route 📍
            </Button>
            <Button variant="outline" size="sm" disabled>
              Crew 👥
            </Button>
            <Button variant="outline" size="sm" disabled>
              Teilen ↗
            </Button>
          </div>

          {/* Primary CTA */}
          <div className="pt-4">
            <AddToCalendarButton 
              eventId={event.id}
              initialIsInCalendar={initialIsInCalendar}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
