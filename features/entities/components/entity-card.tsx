import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Entity } from '../types'

interface EntityCardProps {
  entity: Entity
  showFollowButton?: boolean
}

export function EntityCard({ entity, showFollowButton = false }: EntityCardProps) {
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

  return (
    <Link href={`/entities/${entity.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={entity.avatar_url || undefined} alt={entity.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{entity.name}</h3>
              {entity.verified && (
                <Badge variant="secondary" className="text-xs">
                  ✓
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {typeLabel}
              {entity.handle && ` • @${entity.handle}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
