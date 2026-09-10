# Calendario La 11

Calendario de eventos escolares para la Escuela N° 11. Permite a los administradores gestionar eventos y a los padres/alumnos verlos en un calendario público.

## Stack

- **Next.js 16** con App Router y React 19
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Drizzle ORM** + **PostgreSQL** (Neon serverless)
- **Better Auth** para autenticación email/password
- **shadcn/ui** (estilo "new-york", colores neutral)
- **date-fns** con locale español para formateo de fechas
- **pnpm** como gestor de paquetes

## Comandos

```bash
pnpm dev      # servidor dev en localhost:3000
pnpm build    # build de producción
pnpm start    # servidor de producción
pnpm lint     # ESLint
```

## Variables de entorno

```
DATABASE_URL          # PostgreSQL connection string (Neon)
BETTER_AUTH_URL       # URL base para autenticación
BETTER_AUTH_SECRET    # Secret para Better Auth
```

## Estructura

```
app/
  page.tsx                  # Vista pública del calendario
  admin/page.tsx            # Dashboard admin (protegido)
  login/page.tsx            # Login de administradores
  api/auth/[...all]/        # Endpoints de Better Auth
  actions/events.ts         # Server actions CRUD de eventos
  actions/event-types.ts    # Server actions CRUD de tipos de evento
components/
  calendar.tsx              # Widget de calendario interactivo
  event-list.tsx            # Lista de eventos (público)
  admin-event-list.tsx      # Gestión de eventos (admin)
  event-form.tsx            # Formulario crear/editar evento
  event-type-manager.tsx    # Gestión de tipos de evento (admin)
  login-form.tsx            # Formulario de login
  ui/                       # Componentes shadcn/ui
lib/
  db/schema.ts              # Schema Drizzle (tablas: event, event_type, user, session, account, verification)
  db/index.ts               # Conexión a la base de datos
  auth.ts                   # Configuración Better Auth (servidor)
  auth-client.ts            # Hooks Better Auth (cliente)
  event-types.ts            # Paleta de colores fija + helpers + tipos por defecto (fallback)
  utils.ts                  # Utilidades (cn)
hooks/
  use-mobile.ts
  use-toast.ts
```

## Modelo de datos

**Tabla `event`:**
- `id`, `title`, `description`, `location`
- `eventDate`, `eventEndDate` (timestamp with timezone)
- `eventType` (texto libre; referencia lógica a `event_type.key`)
- `allDay` (boolean)
- `createdBy` (FK a user), `createdAt`, `updatedAt`

**Tabla `event_type`:**
- `key` (PK, slug), `label`, `color` (clave de `EVENT_COLORS` en `lib/event-types.ts`), `createdAt`
- Los admins crean/eliminan tipos desde `/admin`. Un tipo no se puede eliminar si hay eventos usándolo.
- Se siembra con `DEFAULT_EVENT_TYPES` la primera vez que se lee y la tabla está vacía. Si la tabla no existe todavía, `getEventTypes()` cae a los defaults.
- Requiere `pnpm db:push` para crear la tabla.

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Calendario con lista de próximos eventos |
| `/login` | Público | Login de admins (redirige a /admin si ya está autenticado) |
| `/admin` | Protegido | CRUD de eventos y de tipos de evento |
| `/api/auth/[...all]` | API | Endpoints de Better Auth |

## Server Actions (`app/actions/events.ts`)

- `getEvents()` — todos los eventos
- `getUpcomingEvents(limit)` — próximos N eventos
- `getEventsByMonth(year, month)` — eventos de un mes
- `createEvent(data)` — crear evento (requiere auth)
- `updateEvent(id, data)` — editar evento (requiere auth)
- `deleteEvent(id)` — eliminar evento (requiere auth)

## Server Actions (`app/actions/event-types.ts`)

- `getEventTypes()` — tipos de evento (siembra defaults si está vacío, fallback si no hay tabla)
- `createEventType({ label, color })` — crear tipo, genera `key` único (requiere auth)
- `deleteEventType(key)` — eliminar tipo; falla si hay eventos usándolo (requiere auth)

Todas las mutaciones llaman `revalidatePath('/')` y `revalidatePath('/admin')`.

## Tipos de evento y colores

- Los tipos de evento son **dinámicos** (tabla `event_type`), gestionados desde `/admin`.
- Cada tipo tiene un `color` que es una clave de `EVENT_COLORS` en `lib/event-types.ts`.
- `EVENT_COLORS` es una paleta **fija** (~17 colores) con todas las clases de Tailwind
  escritas literalmente — Tailwind no soporta clases dinámicas, por eso no se pueden
  usar colores arbitrarios/hex sin cambiar el enfoque.
- Los consumidores (`calendar`, `event-list`, `admin-event-list`, `event-form`) reciben
  los tipos como prop desde las páginas server y resuelven color/label con
  `buildEventTypeMap()` + `eventColor()`.
- Tipos por defecto (seed / fallback): `academico` (azul), `reunion` (ámbar),
  `paseos` (verde), `sinClase` (rojo), `ventaMerienda` (naranja).

## Decisiones de arquitectura

- La UI del calendario está construida a medida con `date-fns` (semanas lunes-domingo)
- Separación clara cliente/servidor: formularios e interacciones son Client Components, fetching es Server Side
- Todo el texto está en español, hardcodeado (sin i18n library)
- `next.config.mjs` ignora errores de TypeScript en build — mantener esto en mente al desarrollar
