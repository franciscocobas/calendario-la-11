export const EVENT_TYPES = {
  academico: {
    label: 'Academico',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-100',
  },
  reunion: {
    label: 'Reuniones',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgLight: 'bg-amber-100',
  },
  social: {
    label: 'Social',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-100',
  },
  deporte: {
    label: 'Deporte',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgLight: 'bg-red-100',
  },
} as const

export type EventType = keyof typeof EVENT_TYPES
