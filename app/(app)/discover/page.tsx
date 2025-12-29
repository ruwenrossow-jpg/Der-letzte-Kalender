import { getEntities } from '@/features/entities/server'
import { EntityCard } from '@/features/entities/components/entity-card'
import { Card, CardContent } from '@/components/ui/card'
import type { Entity } from '@/features/entities/types'

export default async function DiscoverPage() {
  let entities: Entity[] = []
  let error: string | null = null

  try {
    entities = await getEntities()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load entities'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Entdecken</h1>
        <p className="text-muted-foreground mt-1">
          Finde neue Crews, Profs und Events
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

      {!error && entities.length === 0 && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Keine Entities gefunden</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Führe die seed.sql aus, um Demo-Entities anzulegen.
            </p>
          </CardContent>
        </Card>
      )}

      {!error && entities.length > 0 && (
        <div className="space-y-3">
          {entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      )}
    </div>
  )
}
