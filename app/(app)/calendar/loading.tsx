import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      {/* Date Navigation Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Events List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
