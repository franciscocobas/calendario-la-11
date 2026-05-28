'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EVENT_TYPES, type EventType } from '@/lib/event-types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Event } from '@/lib/db/schema'

interface CalendarProps {
  events: Event[]
}

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

export function Calendar({ events }: CalendarProps) {
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedFilter, setSelectedFilter] = useState<EventType | 'todos'>('todos')

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'todos') return events
    return events.filter(e => e.eventType === selectedFilter)
  }, [events, selectedFilter])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get padding days from previous month (week starts on Monday)
  const startDayOfWeek = getDay(monthStart)
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.eventDate), day)
    )
  }

  const today = new Date()

  if (!mounted) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-8 bg-muted rounded mb-6 w-48"></div>
        <div className="h-10 bg-muted rounded mb-6"></div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Escuela N 123</p>
          <h1 className="text-2xl font-bold text-foreground">Calendario escolar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={previousMonth} aria-label="Mes anterior">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium min-w-[140px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Mes siguiente">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={selectedFilter === 'todos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('todos')}
          className={selectedFilter === 'todos' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          Todos
        </Button>
        {(Object.keys(EVENT_TYPES) as EventType[]).map((type) => (
          <Button
            key={type}
            variant={selectedFilter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(type)}
            className={selectedFilter === type ? `${EVENT_TYPES[type].color} hover:opacity-90` : ''}
          >
            {EVENT_TYPES[type].label}
          </Button>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Padding days from previous month */}
        {Array.from({ length: paddingDays }).map((_, index) => {
          const prevMonthDay = new Date(monthStart)
          prevMonthDay.setDate(prevMonthDay.getDate() - (paddingDays - index))
          return (
            <div key={`padding-start-${index}`} className="aspect-square flex flex-col items-center justify-center p-1">
              <span className="text-sm text-muted-foreground/50">{prevMonthDay.getDate()}</span>
            </div>
          )
        })}

        {/* Days of current month */}
        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square flex flex-col items-center justify-center p-1 rounded-lg relative ${
                isToday ? 'bg-emerald-100 ring-2 ring-emerald-500' : ''
              } ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}`}
            >
              <span className={`text-sm ${isToday ? 'font-bold text-emerald-700' : ''}`}>
                {day.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={event.id || idx}
                      className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPES[event.eventType as EventType]?.color || 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Padding days for next month */}
        {(() => {
          const endDayOfWeek = getDay(monthEnd)
          const paddingEnd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek
          return Array.from({ length: paddingEnd }).map((_, index) => (
            <div key={`padding-end-${index}`} className="aspect-square flex flex-col items-center justify-center p-1">
              <span className="text-sm text-muted-foreground/50">{index + 1}</span>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}
