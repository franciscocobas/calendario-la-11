import Link from 'next/link'
import { Calendar } from '@/components/calendar'
import { EventList } from '@/components/event-list'
import { getEvents, getUpcomingEvents } from '@/app/actions/events'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const [events, upcomingEvents] = await Promise.all([
    getEvents(),
    getUpcomingEvents(5)
  ])

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Admin link */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin" aria-label="Administrar eventos">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Calendar */}
        <Calendar events={events} />

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Upcoming Events */}
        <EventList events={upcomingEvents} />
      </div>
    </main>
  )
}
