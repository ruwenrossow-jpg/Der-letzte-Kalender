import { getEntity, isFollowingEntity } from '@/features/entities/server'
import { EntityProfile } from '@/features/entities/components/entity-profile'
import { notFound } from 'next/navigation'

interface EntityPageProps {
  params: Promise<{ id: string }>
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { id } = await params
  const entity = await getEntity(id)

  if (!entity) {
    notFound()
  }

  const isFollowing = await isFollowingEntity(id)

  return <EntityProfile entity={entity} isFollowing={isFollowing} />
}
