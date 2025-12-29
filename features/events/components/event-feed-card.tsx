import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import type { EventWithEntity } from '../types'
import { MapPin, Calendar, Users } from 'lucide-react'
import { EventDetailSheet } from './event-detail-sheet'

interface EventFeedCardProps {
  event: EventWithEntity
  attendeesCount?: number
}

export function EventFeedCard({ event, attendeesCount = 0 }: EventFeedCardProps) {
  // Add defensive checks for null/undefined dates
  if (!event.start_at) {
    return null // Don't render if essential data is missing
  }

  const startDate = new Date(event.start_at)
  const dateStr = format(startDate, 'EEE, d. MMM', { locale: de })
  const timeStr = format(startDate, 'HH:mm', { locale: de })

  const entityInitials = event.entity.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const typeColor = {
    professor: 'bg-blue-100 text-blue-700',
    crew: 'bg-green-100 text-green-700',
    business: 'bg-purple-100 text-purple-700',
  }[event.entity.type]

  return (
    <EventDetailSheet event={event} attendeesCount={attendeesCount} trigger={
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Hero Image */}
        {event.cover_image_url && (
          <div className="relative h-48 w-full bg-muted">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          {/* Organizer Pill */}
          <Link
            href={`/entities/${event.entity.id}`}
            className="inline-flex items-center gap-2 hover:bg-accent px-2 py-1 rounded-md transition-colors -ml-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.entity.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{entityInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{event.entity.name}</span>
            {event.entity.verified && (
              <Badge variant="secondary" className="text-xs py-0">
                ✓
              </Badge>
            )}
          </Link>

          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight">{event.title}</h3>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {dateStr} • {timeStr}
              </span>
            </div>
            {event.location_name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location_name}</span>
              </div>
            )}
          </div>

          {/* Social Proof */}
          {attendeesCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{attendeesCount} gehen</span>
            </div>
          )}
        </CardContent>
      </Card>
    } />
  )
}
