'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { createEvent, updateEvent } from '@/app/actions/events'
import { EVENT_TYPES, type EventType } from '@/lib/event-types'
import { format } from 'date-fns'
import type { Event } from '@/lib/db/schema'

interface EventFormProps {
  event?: Event
  onSuccess?: () => void
}

export function EventForm({ event, onSuccess }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [allDay, setAllDay] = useState(event?.allDay || false)
  const [eventDate, setEventDate] = useState(
    event?.eventDate
      ? format(new Date(event.eventDate), event?.allDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm")
      : ''
  )
  const [eventEndDate, setEventEndDate] = useState(
    event?.eventEndDate
      ? format(new Date(event.eventEndDate), event?.allDay ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm")
      : ''
  )
  const [eventType, setEventType] = useState<EventType>(
    (event?.eventType as EventType) || 'academico'
  )
  const [location, setLocation] = useState(event?.location || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAllDayChange = (checked: boolean) => {
    setAllDay(checked)
    if (checked) {
      setEventDate(d => d ? d.slice(0, 10) : '')
      setEventEndDate(d => d ? d.slice(0, 10) : '')
    } else {
      setEventDate(d => d ? `${d}T00:00` : '')
      setEventEndDate(d => d ? `${d}T00:00` : '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // For all-day events the input is "yyyy-MM-dd" which `new Date()` parses
      // as UTC midnight, shifting the day back in negative-offset timezones.
      // Appending a time forces local-time parsing so the calendar day is kept.
      const parseDate = (value: string) =>
        new Date(value.length === 10 ? `${value}T00:00` : value)

      const data = {
        title,
        description: description || undefined,
        eventDate: parseDate(eventDate),
        eventEndDate: eventEndDate ? parseDate(eventEndDate) : undefined,
        eventType,
        location: location || undefined,
        allDay,
      }

      if (isEditing && event) {
        await updateEvent(event.id, data)
      } else {
        await createEvent(data)
      }

      router.refresh()
      onSuccess?.()

      if (!isEditing) {
        // Reset form
        setTitle('')
        setDescription('')
        setEventDate('')
        setEventEndDate('')
        setEventType('academico')
        setLocation('')
        setAllDay(false)
      }
    } catch (err) {
      setError('Error al guardar el evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Titulo *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Reunion de padres"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="allDay"
            checked={allDay}
            onCheckedChange={handleAllDayChange}
          />
          <Label htmlFor="allDay" className="cursor-pointer">Todo el dia</Label>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="eventDate">Fecha de inicio *</Label>
          <Input
            id="eventDate"
            type={allDay ? 'date' : 'datetime-local'}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="eventEndDate">Fecha de fin <span className="text-muted-foreground font-normal">(opcional)</span></Label>
          <Input
            id="eventEndDate"
            type={allDay ? 'date' : 'datetime-local'}
            value={eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
            min={eventDate}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="eventType">Tipo *</Label>
          <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(EVENT_TYPES) as EventType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {EVENT_TYPES[type].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Ubicacion</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Aula 5, Patio central, etc."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descripcion</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles adicionales del evento..."
            rows={3}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading 
            ? 'Guardando...' 
            : isEditing 
              ? 'Actualizar Evento' 
              : 'Crear Evento'}
        </Button>
      </form>
    </Card>
  )
}
