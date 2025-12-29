'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, MapPin } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import type { MixedCalendarItem } from '../server'

interface LiveStatusCardProps {
  current: MixedCalendarItem | null
  next: MixedCalendarItem | null
}

export function LiveStatusCard({ current, next }: LiveStatusCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [countdown, setCountdown] = useState<string>('')

  useEffect(() => {
    const updateTimes = () => {
      if (current) {
        const endTime = new Date(current.event.end_at)
        const now = new Date()
        const diff = endTime.getTime() - now.getTime()
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          
          if (hours > 0) {
            setTimeLeft(`Noch ${hours} Std ${minutes} Min`)
          } else {
            setTimeLeft(`Noch ${minutes} Min`)
          }
        } else {
          setTimeLeft('Endet gerade')
        }
      }
      
      if (next && !current) {
        const startTime = new Date(next.event.start_at)
        const now = new Date()
        const diff = startTime.getTime() - now.getTime()
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          
          if (hours > 0) {
            setCountdown(`in ${hours} Std ${minutes} Min`)
          } else {
            setCountdown(`in ${minutes} Min`)
          }
        }
      }
    }

    updateTimes()
    const interval = setInterval(updateTimes, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [current, next])

  // Case 1: Current event is happening NOW
  if (current) {
    const event = current.event
    const isPersonal = current.type === 'personal'
    const startTime = format(new Date(event.start_at), 'HH:mm')
    const endTime = format(new Date(event.end_at), 'HH:mm')

    return (
      <Card className="border-red-500 border-2 bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-background sticky top-0 z-30">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <Badge variant="destructive" className="text-xs font-bold">
                  JETZT LIVE
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                {timeLeft}
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{event.title}</h3>
                {isPersonal ? (
                  <Badge variant="outline" className="text-xs">🔒</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">👥</Badge>
                )}
              </div>
              
              {!isPersonal && 'entity' in event && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={event.entity.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {event.entity.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{event.entity.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{startTime} – {endTime}</span>
              </div>
              {event.location_name && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location_name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Case 2: Next event upcoming
  if (next) {
    const event = next.event
    const isPersonal = next.type === 'personal'
    const startTime = format(new Date(event.start_at), 'HH:mm')

    return (
      <Card className="border-blue-500 border-2 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background sticky top-0 z-30">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-bold">
                ⏰ Als Nächstes
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {countdown}
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{event.title}</h3>
                {isPersonal ? (
                  <Badge variant="outline" className="text-xs">🔒</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">👥</Badge>
                )}
              </div>
              
              {!isPersonal && 'entity' in event && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={event.entity.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {event.entity.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{event.entity.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{startTime} Uhr</span>
              </div>
              {event.location_name && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location_name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Case 3: No events scheduled
  return (
    <Card className="border-green-500 border-2 bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-background sticky top-0 z-30">
      <CardContent className="pt-4 pb-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🌤️</div>
          <p className="font-semibold text-lg">Dein Tag ist frei</p>
          <p className="text-sm text-muted-foreground">Keine anstehenden Termine</p>
        </div>
      </CardContent>
    </Card>
  )
}
