'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { createEventType, deleteEventType } from '@/app/actions/event-types'
import {
  EVENT_COLORS,
  EVENT_COLOR_KEYS,
  eventColor,
  type EventTypeInfo,
} from '@/lib/event-types'

interface EventTypeManagerProps {
  eventTypes: EventTypeInfo[]
}

export function EventTypeManager({ eventTypes }: EventTypeManagerProps) {
  const router = useRouter()
  const [label, setLabel] = useState('')
  const [color, setColor] = useState<string>('blue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!label.trim()) return
    setLoading(true)
    try {
      await createEventType({ label: label.trim(), color })
      setLabel('')
      setColor('blue')
      router.refresh()
    } catch {
      setError('No se pudo crear el tipo de evento')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (key: string) => {
    setError(null)
    setDeletingKey(key)
    try {
      await deleteEventType(key)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar el tipo de evento'
      )
    } finally {
      setDeletingKey(null)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Tipos de evento</h2>

      <ul className="flex flex-col gap-2 mb-4">
        {eventTypes.map((type) => (
          <li
            key={type.key}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${eventColor(type.color).dot}`}
              />
              <span className="truncate text-sm">{type.label}</span>
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  aria-label={`Eliminar tipo ${type.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar tipo de evento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminará el tipo &quot;{type.label}&quot;. Solo es posible si
                    ningún evento lo está usando.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(type.key)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deletingKey === type.key ? 'Eliminando...' : 'Eliminar'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 border-t pt-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="typeLabel">Nuevo tipo</Label>
          <Input
            id="typeLabel"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: Salida didáctica"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="typeColor">Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger id="typeColor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_COLOR_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${EVENT_COLORS[key].dot}`}
                    />
                    {EVENT_COLORS[key].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar tipo'}
        </Button>
      </form>
    </Card>
  )
}
