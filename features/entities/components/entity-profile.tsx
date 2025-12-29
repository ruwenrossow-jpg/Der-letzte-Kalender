import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { FollowButton } from './follow-button'
import { EventFeedCard } from '@/features/events/components/event-feed-card'
import { getEntityEvents, getAttendeesCount } from '@/features/events/server'
import type { Entity } from '../types'
import type { EventWithEntity } from '@/features/events/types'

interface EntityProfileProps {
  entity: Entity
  isFollowing: boolean
}

export async function EntityProfile({ entity, isFollowing }: EntityProfileProps) {
  const typeLabel = {
    professor: 'Professor',
    crew: 'Crew',
    business: 'Business',
  }[entity.type]

  const initials = entity.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Fetch upcoming events
  let upcomingEvents: EventWithEntity[] = []
  let eventsAttendees: Map<string, number> = new Map()
  try {
    upcomingEvents = await getEntityEvents(entity.id)
    
    // Fetch attendees count for each event
    const counts = await Promise.all(
      upcomingEvents.map(async (event) => ({
        eventId: event.id,
        count: await getAttendeesCount(event.id),
      }))
    )
    eventsAttendees = new Map(counts.map(c => [c.eventId, c.count]))
  } catch (error) {
    console.error('Failed to load entity events:', error)
  }

  return (
    <div className="space-y-6">
      <PageHeader title={entity.name} />
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={entity.avatar_url || undefined} alt={entity.name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{entity.name}</h1>
            {entity.verified && (
              <Badge variant="secondary">
                ✓ Verifiziert
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mb-3">{typeLabel}</p>
          <FollowButton entityId={entity.id} initialIsFollowing={isFollowing} />
        </div>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Kommende Events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine kommenden Events.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventFeedCard 
                  key={event.id} 
                  event={event} 
                  attendeesCount={eventsAttendees.get(event.id) ?? 0} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
