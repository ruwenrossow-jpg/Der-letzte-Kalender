'use client'

import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

interface UpdatesBadgeProps {
  count: number
}

export function UpdatesBadge({ count }: UpdatesBadgeProps) {
  if (count === 0) {
    return (
      <div className="relative">
        <Bell className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
      >
        {count > 9 ? '9+' : count}
      </Badge>
    </div>
  )
}
