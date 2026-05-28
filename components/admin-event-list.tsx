'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteEvent } from '@/app/actions/events'
import { EVENT_TYPES, type EventType } from '@/lib/event-types'
import { EventForm } from './event-form'
import type { Event } from '@/lib/db/schema'

interface AdminEventListProps {
  events: Event[]
}

export function AdminEventList({ events }: AdminEventListProps) {
  const router = useRouter()
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    await deleteEvent(id)
    router.refresh()
    setDeletingId(null)
  }

  if (events.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No hay eventos. Crea el primero usando el formulario.
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {events.map((event) => {
          const eventDate = new Date(event.eventDate)
          const eventTypeConfig = EVENT_TYPES[event.eventType as EventType]

          return (
            <Card key={event.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${eventTypeConfig?.bgLight || 'bg-gray-100'} ${eventTypeConfig?.textColor || 'text-gray-700'}`}>
                      {eventTypeConfig?.label || event.eventType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(eventDate, "d 'de' MMMM yyyy", { locale: es })}
                    {!event.allDay && ` - ${format(eventDate, 'HH:mm', { locale: es })}`}
                    {event.allDay && ' - Todo el dia'}
                  </p>
                  {event.location && (
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingEvent(event)}
                    aria-label="Editar evento"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label="Eliminar evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar evento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta accion no se puede deshacer. Se eliminara permanentemente el evento &quot;{event.title}&quot;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(event.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletingId === event.id ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <EventForm 
              event={editingEvent} 
              onSuccess={() => setEditingEvent(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
