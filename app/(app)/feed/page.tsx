import { getFeedEventsWithAttendeeCount } from '@/features/events/server'
import { getCurrentAndNextEvent } from '@/features/calendar/server'
import { EventFeedCard } from '@/features/events/components/event-feed-card'
import { LiveStatusCard } from '@/features/calendar/components/live-status-card'
import { Card, CardContent } from '@/components/ui/card'
import type { EventWithEntity } from '@/features/events/types'

export default async function FeedPage() {
  let events: Array<EventWithEntity & { attendees_count: number }> = []
  let error: string | null = null

  try {
    // Use optimized query that fetches events with attendee counts in 2 queries instead of N+1
    events = await getFeedEventsWithAttendeeCount()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load events'
  }

  // Fetch current and next event for live status
  const { current, next } = await getCurrentAndNextEvent()

  return (
    <div className="space-y-6">
      {/* Live Status Card */}
      <LiveStatusCard current={current} next={next} />

      <div>
        <h1 className="text-3xl font-bold">Dein Flow</h1>
        <p className="text-muted-foreground mt-1">
          Events von deinen Crews und Profs
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">
            <p className="font-semibold">Fehler beim Laden</p>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {!error && events.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Noch keine Events</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Folge Entities in "Entdecken", um Events in deinem Feed zu sehen.
            </p>
          </CardContent>
        </Card>
      )}

      {!error && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => (
            <EventFeedCard 
              key={event.id} 
              event={event} 
              attendeesCount={event.attendees_count} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
