'use client'

import { useState, useEffect } from 'react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { EVENT_TYPES, type EventType } from '@/lib/event-types'
import type { Event } from '@/lib/db/schema'

interface EventListProps {
  events: Event[]
}

function formatEventDate(date: Date) {
  if (isToday(date)) {
    return { day: format(date, 'd'), label: 'HOY' }
  }
  if (isTomorrow(date)) {
    return { day: format(date, 'd'), label: 'MANANA' }
  }
  return { 
    day: format(date, 'd'), 
    label: format(date, 'EEE', { locale: es }).toUpperCase().replace('.', '')
  }
}

export function EventList({ events }: EventListProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-40"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-12 w-10 bg-muted rounded"></div>
              <div className="flex-1 h-12 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay eventos proximos
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Proximos eventos</h2>
      <div className="space-y-3">
        {events.map((event) => {
          const eventDate = new Date(event.eventDate)
          const { day, label } = formatEventDate(eventDate)
          const eventTypeConfig = EVENT_TYPES[event.eventType as EventType]

          return (
            <div key={event.id} className="flex items-start gap-4">
              {/* Date column */}
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-2xl font-bold text-foreground">{day}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>

              {/* Color bar */}
              <div className={`w-1 self-stretch rounded-full ${eventTypeConfig?.color || 'bg-gray-400'}`} />

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    {event.allDay 
                      ? 'Todo el dia' 
                      : format(eventDate, 'HH:mm', { locale: es })}
                    {event.location && ` · ${event.location}`}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${eventTypeConfig?.bgLight || 'bg-gray-100'} ${eventTypeConfig?.textColor || 'text-gray-700'}`}>
                    {eventTypeConfig?.label || event.eventType}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
