'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildEventTypeMap, eventColor, type EventTypeInfo } from '@/lib/event-types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Event } from '@/lib/db/schema'

interface CalendarProps {
  events: Event[]
  eventTypes: EventTypeInfo[]
}

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

export function Calendar({ events, eventTypes }: CalendarProps) {
  const typeMap = buildEventTypeMap(eventTypes)
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  useEffect(() => {
    setMounted(true)
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get padding days from previous month (week starts on Monday)
  const startDayOfWeek = getDay(monthStart)
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const start = startOfDay(new Date(event.eventDate))
      const end = event.eventEndDate ? startOfDay(new Date(event.eventEndDate)) : start
      const d = startOfDay(day)
      return d >= start && d <= end
    })
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Calendario inicial 4</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground">Escuela N 11</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={previousMonth} aria-label="Mes anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[110px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Mes siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
          const isPast = isBefore(startOfDay(day), startOfDay(today))

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square flex flex-col items-center justify-center p-1 rounded-lg relative ${isToday ? 'bg-emerald-100 ring-2 ring-emerald-500' : ''
                } ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}`}
            >
              <span className={`text-sm ${isToday ? 'font-bold text-emerald-700' : isPast ? 'text-gray-300' : ''}`}>
                {day.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={event.id || idx}
                      className={`w-1.5 h-1.5 rounded-full ${isPast ? 'opacity-40' : ''} ${eventColor(typeMap[event.eventType]?.color).dot}`}
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
          return Array.from({ length: paddingEnd }).map((_, index) => {
            const nextMonthDay = new Date(monthEnd)
            nextMonthDay.setDate(nextMonthDay.getDate() + index + 1)
            const dayEvents = getEventsForDay(nextMonthDay)
            return (
              <div key={`padding-end-${index}`} className="aspect-square flex flex-col items-center justify-center p-1">
                <span className="text-sm text-muted-foreground/50">{nextMonthDay.getDate()}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={event.id || idx}
                        className={`w-1.5 h-1.5 rounded-full ${eventColor(typeMap[event.eventType]?.color).dot}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
