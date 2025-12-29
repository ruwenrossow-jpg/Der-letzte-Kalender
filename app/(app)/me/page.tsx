import { getUser, signOut } from '@/features/auth/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar as CalendarIcon, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getFollowedEntities } from '@/features/entities/server'
import { getUserCreatedEvents } from '@/features/events/server'
import { getUserStats, getPastEvents } from '@/features/calendar/server'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Entity } from '@/features/entities/types'
import type { EventWithEntity } from '@/features/events/types'

export default async function MePage() {
  const user = await getUser()

  // ALLE User können Events erstellen!
  const canCreateEvents = true

  // Fetch followed entities, user's created events, stats, and history
  let followedEntities: Entity[] = []
  let myEvents: EventWithEntity[] = []
  let stats = { attendedCount: 0, followedCount: 0, createdCount: 0 }
  let pastEvents: Awaited<ReturnType<typeof getPastEvents>> = []
  
  try {
    followedEntities = await getFollowedEntities()
    myEvents = await getUserCreatedEvents()
    stats = await getUserStats()
    pastEvents = await getPastEvents()
  } catch (error) {
    console.error('Failed to fetch profile data:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil</h1>
          <p className="text-muted-foreground mt-1">
            {user?.email || 'Dein Account'}
          </p>
        </div>
        <Link href="/me/edit">
          <Button variant="outline">
            ✏️ Profil bearbeiten
          </Button>
        </Link>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">E-Mail</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">User ID</div>
            <div className="font-mono text-xs text-muted-foreground">{user?.id}</div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Deine Aktivität</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground mr-1" />
              </div>
              <p className="text-2xl font-bold">{stats.attendedCount}</p>
              <p className="text-xs text-muted-foreground">Events besucht</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-muted-foreground mr-1" />
              </div>
              <p className="text-2xl font-bold">{stats.followedCount}</p>
              <p className="text-xs text-muted-foreground">Entities gefolgt</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Sparkles className="h-4 w-4 text-muted-foreground mr-1" />
              </div>
              <p className="text-2xl font-bold">{stats.createdCount}</p>
              <p className="text-xs text-muted-foreground">Events erstellt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Event Button - für ALLE User */}
      <Link href="/create-event">
        <Button className="w-full" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Event erstellen
        </Button>
      </Link>

      {/* Following Section */}
      <Card>
        <CardHeader>
          <CardTitle>Following</CardTitle>
        </CardHeader>
        <CardContent>
          {followedEntities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Du folgst noch keinen Entities.
            </p>
          ) : (
            <div className="space-y-3">
              {followedEntities.map((entity) => {
                const initials = entity.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                const typeLabels: Record<string, string> = {
                  professor: 'Professor',
                  crew: 'Crew',
                  business: 'Business',
                }
                const typeLabel = typeLabels[entity.type] || entity.type
                
                return (
                  <Link
                    key={entity.id}
                    href={`/entities/${entity.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entity.avatar_url || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entity.name}</span>
                        {entity.verified && (
                          <Badge variant="secondary" className="text-xs py-0">✓</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{typeLabel}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Events Section */}
      <Card>
        <CardHeader>
          <CardTitle>Meine Events</CardTitle>
        </CardHeader>
        <CardContent>
          {myEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Du hast noch keine Events erstellt.
            </p>
          ) : (
            <div className="space-y-3">
              {myEvents.map((event) => {
                const startDate = new Date(event.start_at)
                const dateStr = format(startDate, 'EEE, d. MMM', { locale: de })
                const timeStr = format(startDate, 'HH:mm', { locale: de })
                
                return (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="font-medium mb-1">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {dateStr} • {timeStr} Uhr
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.entity.name}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Events Section */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Vergangene Events ({pastEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pastEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Events besucht.
            </p>
          ) : (
            <div className="space-y-3">
              {pastEvents.map((item) => {
                const endDate = new Date(item.event.end_at)
                const dateStr = format(endDate, 'EEE, d. MMM', { locale: de })
                const timeStr = format(endDate, 'HH:mm', { locale: de })
                const isPersonal = item.type === 'personal'
                const location = item.event.location_name
                
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium">{item.event.title}</div>
                      <Badge variant={isPersonal ? 'default' : 'secondary'} className="ml-2">
                        {isPersonal ? 'Persönlich' : 'Geteilt'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dateStr} • {timeStr} Uhr
                    </div>
                    {location && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📍 {location}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          Abmelden
        </Button>
      </form>
    </div>
  )
}
