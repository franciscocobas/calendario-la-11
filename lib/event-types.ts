// Tipos de evento: los datos (key/label/color) viven en la base de datos
// (tabla `event_type`), pero la paleta de colores es fija y está definida acá
// para que Tailwind pueda generar las clases (no soporta clases dinámicas).

export interface EventTypeInfo {
  key: string
  label: string
  color: string
}

interface ColorClasses {
  /** Punto / barra sólida (calendario, lista) */
  dot: string
  /** Texto del badge */
  text: string
  /** Fondo claro del badge */
  bgLight: string
  /** Nombre para mostrar en el selector */
  label: string
}

// IMPORTANTE: todas las clases deben estar escritas literalmente para que
// Tailwind las incluya en el build.
export const EVENT_COLORS = {
  slate: { dot: 'bg-slate-500', text: 'text-slate-700', bgLight: 'bg-slate-100', label: 'Gris' },
  red: { dot: 'bg-red-500', text: 'text-red-700', bgLight: 'bg-red-100', label: 'Rojo' },
  orange: { dot: 'bg-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-100', label: 'Naranja' },
  amber: { dot: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-100', label: 'Ámbar' },
  yellow: { dot: 'bg-yellow-500', text: 'text-yellow-700', bgLight: 'bg-yellow-100', label: 'Amarillo' },
  lime: { dot: 'bg-lime-500', text: 'text-lime-700', bgLight: 'bg-lime-100', label: 'Lima' },
  green: { dot: 'bg-green-500', text: 'text-green-700', bgLight: 'bg-green-100', label: 'Verde' },
  teal: { dot: 'bg-teal-500', text: 'text-teal-700', bgLight: 'bg-teal-100', label: 'Turquesa' },
  cyan: { dot: 'bg-cyan-500', text: 'text-cyan-700', bgLight: 'bg-cyan-100', label: 'Cian' },
  sky: { dot: 'bg-sky-500', text: 'text-sky-700', bgLight: 'bg-sky-100', label: 'Celeste' },
  blue: { dot: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-100', label: 'Azul' },
  indigo: { dot: 'bg-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-100', label: 'Índigo' },
  violet: { dot: 'bg-violet-500', text: 'text-violet-700', bgLight: 'bg-violet-100', label: 'Violeta' },
  purple: { dot: 'bg-purple-500', text: 'text-purple-700', bgLight: 'bg-purple-100', label: 'Púrpura' },
  fuchsia: { dot: 'bg-fuchsia-500', text: 'text-fuchsia-700', bgLight: 'bg-fuchsia-100', label: 'Fucsia' },
  pink: { dot: 'bg-pink-500', text: 'text-pink-700', bgLight: 'bg-pink-100', label: 'Rosa' },
  rose: { dot: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-100', label: 'Rosado' },
} as const

export type EventColorKey = keyof typeof EVENT_COLORS

export const EVENT_COLOR_KEYS = Object.keys(EVENT_COLORS) as EventColorKey[]

const FALLBACK_COLOR: ColorClasses = {
  dot: 'bg-gray-400',
  text: 'text-gray-700',
  bgLight: 'bg-gray-100',
  label: '—',
}

/** Devuelve las clases de Tailwind para un color, con fallback gris. */
export function eventColor(color: string | null | undefined): ColorClasses {
  return EVENT_COLORS[color as EventColorKey] ?? FALLBACK_COLOR
}

/** Índice por `key` para resolver rápido el tipo de un evento. */
export function buildEventTypeMap(
  types: EventTypeInfo[]
): Record<string, EventTypeInfo> {
  return Object.fromEntries(types.map((t) => [t.key, t]))
}

// Tipos por defecto: se usan para sembrar la tabla la primera vez y como
// fallback si la base todavía no tiene la tabla `event_type`.
export const DEFAULT_EVENT_TYPES: EventTypeInfo[] = [
  { key: 'academico', label: 'Academico', color: 'blue' },
  { key: 'reunion', label: 'Reuniones', color: 'amber' },
  { key: 'paseos', label: 'Paseos', color: 'green' },
  { key: 'sinClase', label: 'Sin Clase', color: 'red' },
  { key: 'ventaMerienda', label: 'Venta de Merienda', color: 'orange' },
]
