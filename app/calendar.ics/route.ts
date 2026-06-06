import { getEvents } from '@/app/actions/events'
import type { Event } from '@/lib/db/schema'

// Zona horaria de la escuela (Argentina, sin horario de verano).
const TIME_ZONE = 'America/Argentina/Buenos_Aires'

// Cachear el feed por 30 min. Google re-consulta cada varias horas de todos modos.
export const revalidate = 1800

export async function GET(request: Request) {
  const events = await getEvents()
  const host = new URL(request.url).host

  const body = buildCalendar(events, host)

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="calendario-la-11.ics"',
    },
  })
}

function buildCalendar(events: Event[], host: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendario La 11//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    // NAME (RFC 7986) y X-WR-CALNAME (legado): distintos clientes leen una u otra.
    'NAME:Calendario La 11',
    'X-WR-CALNAME:Calendario La 11',
    'X-WR-CALDESC:Eventos de la Escuela N° 11',
    'X-WR-TIMEZONE:' + TIME_ZONE,
  ]

  for (const ev of events) {
    lines.push(...buildEvent(ev, host))
  }

  lines.push('END:VCALENDAR')

  // Plegado de líneas largas (límite de 75 octetos) y terminación CRLF.
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

function buildEvent(ev: Event, host: string): string[] {
  const start = ev.eventDate
  const end = ev.eventEndDate

  const lines = [
    'BEGIN:VEVENT',
    `UID:event-${ev.id}@${host}`,
    `DTSTAMP:${formatUtc(ev.updatedAt ?? ev.createdAt ?? new Date())}`,
  ]

  if (ev.allDay) {
    // Eventos de día completo usan VALUE=DATE; DTEND es exclusivo (día siguiente al último).
    lines.push(`DTSTART;VALUE=DATE:${formatDate(dateParts(start))}`)
    lines.push(`DTEND;VALUE=DATE:${formatDate(addDay(dateParts(end ?? start)))}`)
  } else {
    lines.push(`DTSTART:${formatUtc(start)}`)
    // Si no hay fin definido, asumimos 1 hora de duración.
    lines.push(`DTEND:${formatUtc(end ?? new Date(start.getTime() + 60 * 60 * 1000))}`)
  }

  lines.push(`SUMMARY:${escapeText(ev.title)}`)
  if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`)
  if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`)
  if (ev.eventType) lines.push(`CATEGORIES:${escapeText(ev.eventType)}`)

  lines.push('END:VEVENT')
  return lines
}

// --- Helpers de formato de fecha -------------------------------------------

// YYYYMMDDTHHMMSSZ en UTC, para eventos con hora.
function formatUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

type DateParts = { y: number; m: number; d: number }

// Componentes de fecha civil en la zona horaria de la escuela.
function dateParts(date: Date): DateParts {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [y, m, d] = fmt.format(date).split('-').map(Number)
  return { y, m, d }
}

// Suma un día calendario (para DTEND exclusivo), con normalización de mes/año.
function addDay({ y, m, d }: DateParts): DateParts {
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }
}

// YYYYMMDD para eventos de día completo.
function formatDate({ y, m, d }: DateParts): string {
  return `${y}${pad(m)}${pad(d)}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

// Escapa caracteres especiales según RFC 5545.
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Pliega líneas a 75 octetos insertando CRLF + espacio (RFC 5545).
function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf-8')
  if (bytes.length <= 75) return line

  const chunks: string[] = []
  let current = ''
  let currentBytes = 0
  for (const char of line) {
    const charBytes = Buffer.byteLength(char, 'utf-8')
    // Las líneas de continuación llevan 1 octeto de espacio inicial.
    const limit = chunks.length === 0 ? 75 : 74
    if (currentBytes + charBytes > limit) {
      chunks.push(current)
      current = ''
      currentBytes = 0
    }
    current += char
    currentBytes += charBytes
  }
  chunks.push(current)
  return chunks.join('\r\n ')
}
