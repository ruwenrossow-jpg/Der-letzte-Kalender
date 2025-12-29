'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { followEntity, unfollowEntity } from '../server'

interface FollowButtonProps {
  entityId: string
  initialIsFollowing: boolean
}

export function FollowButton({ entityId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    // Optimistic update
    setIsFollowing(!isFollowing)

    startTransition(async () => {
      try {
        if (isFollowing) {
          await unfollowEntity(entityId)
        } else {
          await followEntity(entityId)
        }
      } catch (error) {
        // Revert on error
        setIsFollowing(isFollowing)
        console.error('Failed to toggle follow:', error)
      }
    })
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
    >
      {isPending ? '...' : isFollowing ? 'Folge ich' : 'Folgen'}
    </Button>
  )
}
