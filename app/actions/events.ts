'use server'

import { db } from '@/lib/db'
import { event } from '@/lib/db/schema'
import { eq, gte, lte, and, asc, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getEvents() {
  return db.select().from(event).orderBy(asc(event.eventDate))
}

export async function getUpcomingEvents(limit = 10) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return db
    .select()
    .from(event)
    .where(
      sql`(${event.eventEndDate} IS NOT NULL AND ${event.eventEndDate} >= ${now})
          OR (${event.eventEndDate} IS NULL AND ${event.eventDate} >= ${now})`
    )
    .orderBy(asc(event.eventDate))
    .limit(limit)
}

export async function getEventsByMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)

  return db
    .select()
    .from(event)
    .where(
      and(
        lte(event.eventDate, endDate),
        sql`(${event.eventEndDate} IS NOT NULL AND ${event.eventEndDate} >= ${startDate})
            OR (${event.eventEndDate} IS NULL AND ${event.eventDate} >= ${startDate})`
      )
    )
    .orderBy(asc(event.eventDate))
}

export async function createEvent(data: {
  title: string
  description?: string
  eventDate: Date
  eventEndDate?: Date
  eventType: string
  location?: string
  allDay?: boolean
}) {
  const userId = await getUserId()

  const [newEvent] = await db.insert(event).values({
    title: data.title,
    description: data.description,
    eventDate: data.eventDate,
    eventEndDate: data.eventEndDate ?? null,
    eventType: data.eventType,
    location: data.location,
    allDay: data.allDay ?? false,
    createdBy: userId,
  }).returning()

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/calendar.ics')

  return newEvent
}

export async function updateEvent(id: number, data: {
  title?: string
  description?: string
  eventDate?: Date
  eventEndDate?: Date | null
  eventType?: string
  location?: string
  allDay?: boolean
}) {
  await getUserId() // Ensure user is authenticated
  
  const [updated] = await db
    .update(event)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(event.id, id))
    .returning()

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/calendar.ics')

  return updated
}

export async function deleteEvent(id: number) {
  await getUserId() // Ensure user is authenticated
  
  await db.delete(event).where(eq(event.id, id))

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/calendar.ics')
}
