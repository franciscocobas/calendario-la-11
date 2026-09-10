'use server'

import { db } from '@/lib/db'
import { eventType, event } from '@/lib/db/schema'
import { asc, eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  DEFAULT_EVENT_TYPES,
  EVENT_COLOR_KEYS,
  type EventColorKey,
  type EventTypeInfo,
} from '@/lib/event-types'

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function revalidate() {
  revalidatePath('/')
  revalidatePath('/admin')
}

/** Convierte una etiqueta en un slug único para usar como `key`. */
function slugify(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getEventTypes(): Promise<EventTypeInfo[]> {
  try {
    const rows = await db
      .select({
        key: eventType.key,
        label: eventType.label,
        color: eventType.color,
      })
      .from(eventType)
      .orderBy(asc(eventType.label))

    if (rows.length === 0) {
      await db.insert(eventType).values(DEFAULT_EVENT_TYPES).onConflictDoNothing()
      return [...DEFAULT_EVENT_TYPES].sort((a, b) => a.label.localeCompare(b.label))
    }

    return rows
  } catch {
    // La tabla puede no existir todavía (antes de correr `pnpm db:push`).
    return [...DEFAULT_EVENT_TYPES]
  }
}

export async function createEventType(data: { label: string; color: string }) {
  await requireAuth()

  const label = data.label.trim()
  if (!label) throw new Error('La etiqueta es obligatoria')

  const color: EventColorKey = EVENT_COLOR_KEYS.includes(data.color as EventColorKey)
    ? (data.color as EventColorKey)
    : 'slate'

  const base = slugify(label) || 'tipo'

  // Garantiza unicidad del key ante etiquetas repetidas o con los mismos slugs.
  const existing = await db
    .select({ key: eventType.key })
    .from(eventType)
    .where(sql`${eventType.key} = ${base} OR ${eventType.key} LIKE ${base + '-%'}`)
  const taken = new Set(existing.map((r) => r.key))
  let key = base
  let n = 2
  while (taken.has(key)) {
    key = `${base}-${n}`
    n++
  }

  const [created] = await db
    .insert(eventType)
    .values({ key, label, color })
    .returning({ key: eventType.key, label: eventType.label, color: eventType.color })

  revalidate()
  return created
}

export async function deleteEventType(key: string) {
  await requireAuth()

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(event)
    .where(eq(event.eventType, key))

  if (count > 0) {
    throw new Error(
      `No se puede eliminar: hay ${count} evento(s) usando este tipo.`
    )
  }

  await db.delete(eventType).where(eq(eventType.key, key))
  revalidate()
}
