import { NextRequest, NextResponse } from 'next/server'
import { getCalendarItemsForDay } from '@/features/calendar/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
  }

  try {
    const items = await getCalendarItemsForDay(date)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Calendar items API error:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar items' }, { status: 500 })
  }
}
