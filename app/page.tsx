import Link from 'next/link'
import { Calendar } from '@/components/calendar'
import { EventList } from '@/components/event-list'
import { SubscribeButton } from '@/components/subscribe-button'
import { getEvents, getUpcomingEvents } from '@/app/actions/events'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [events, upcomingEvents] = await Promise.all([
    getEvents(),
    getUpcomingEvents(5)
  ])

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Subscribe to calendar */}
        <div className="mb-4 flex justify-center">
          <SubscribeButton />
        </div>

        {/* Calendar */}
        <Calendar events={events} />

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Upcoming Events */}
        <EventList events={upcomingEvents} />

        {/* Footer */}
        <div className="mt-10 text-center border-t border-gray-300">
          <Link href="/admin" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            Ingresá
          </Link>
        </div>
      </div>
    </main>
  )
}
