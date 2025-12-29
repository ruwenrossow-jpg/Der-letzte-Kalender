import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DiscoverLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Entdecken</h1>
        <p className="text-muted-foreground mt-1">
          Finde Crews, Profs und Businesses
        </p>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
