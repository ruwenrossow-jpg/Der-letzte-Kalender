import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function FeedLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dein Flow</h1>
        <p className="text-muted-foreground mt-1">
          Events von deinen Crews und Profs
        </p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              {/* Entity Info */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              {/* Event Title */}
              <Skeleton className="h-6 w-3/4" />

              {/* Event Details */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
