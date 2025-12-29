import { getCalendarItemsForDay } from '@/features/calendar/server'
import { CalendarViewToggle } from '@/features/calendar/components/calendar-view-toggle'
import { CreatePersonalEventButton } from '@/features/personal-events/components/create-personal-event-button'
import { format } from 'date-fns'

export default async function CalendarPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const items = await getCalendarItemsForDay(today)

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold mb-6">Mein Kalender</h1>
      <CalendarViewToggle initialDate={today} initialItems={items} />
      <CreatePersonalEventButton />
    </div>
  )
}
