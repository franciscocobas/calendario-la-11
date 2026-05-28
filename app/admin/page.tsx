import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getEvents } from '@/app/actions/events'
import { EventForm } from '@/components/event-form'
import { AdminEventList } from '@/components/admin-event-list'
import { LogoutButton } from '@/components/logout-button'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/login')
  }

  const events = await getEvents()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Volver al calendario">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Administrar Eventos</h1>
              <p className="text-sm text-muted-foreground">
                Hola, {session.user.name || session.user.email}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Event Form */}
          <div>
            <EventForm />
          </div>

          {/* Event List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Eventos Existentes</h2>
            <AdminEventList events={events} />
          </div>
        </div>
      </div>
    </main>
  )
}
