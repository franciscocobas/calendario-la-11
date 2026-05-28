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
components/
  calendar.tsx              # Widget de calendario interactivo
  event-list.tsx            # Lista de eventos (público)
  admin-event-list.tsx      # Gestión de eventos (admin)
  event-form.tsx            # Formulario crear/editar evento
  login-form.tsx            # Formulario de login
  ui/                       # Componentes shadcn/ui
lib/
  db/schema.ts              # Schema Drizzle (tablas: event, user, session, account, verification)
  db/index.ts               # Conexión a la base de datos
  auth.ts                   # Configuración Better Auth (servidor)
  auth-client.ts            # Hooks Better Auth (cliente)
  event-types.ts            # Tipos de evento con colores
  utils.ts                  # Utilidades (cn)
hooks/
  use-mobile.ts
  use-toast.ts
```

## Modelo de datos

**Tabla `event`:**
- `id`, `title`, `description`, `location`
- `eventDate` (timestamp with timezone)
- `eventType`: `academico` | `reunion` | `social` | `deporte`
- `allDay` (boolean)
- `createdBy` (FK a user), `createdAt`, `updatedAt`

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Calendario con lista de próximos eventos |
| `/login` | Público | Login de admins (redirige a /admin si ya está autenticado) |
| `/admin` | Protegido | CRUD de eventos |
| `/api/auth/[...all]` | API | Endpoints de Better Auth |

## Server Actions (`app/actions/events.ts`)

- `getEvents()` — todos los eventos
- `getUpcomingEvents(limit)` — próximos N eventos
- `getEventsByMonth(year, month)` — eventos de un mes
- `createEvent(data)` — crear evento (requiere auth)
- `updateEvent(id, data)` — editar evento (requiere auth)
- `deleteEvent(id)` — eliminar evento (requiere auth)

Todas las mutaciones llaman `revalidatePath('/')` y `revalidatePath('/admin')`.

## Tipos de evento y colores

| Tipo | Color |
|------|-------|
| `academico` | Azul (`bg-blue-500`) |
| `reunion` | Ámbar (`bg-amber-500`) |
| `social` | Verde (`bg-green-500`) |
| `deporte` | Rojo (`bg-red-500`) |

## Decisiones de arquitectura

- La UI del calendario está construida a medida con `date-fns` (semanas lunes-domingo)
- Separación clara cliente/servidor: formularios e interacciones son Client Components, fetching es Server Side
- Todo el texto está en español, hardcodeado (sin i18n library)
- `next.config.mjs` ignora errores de TypeScript en build — mantener esto en mente al desarrollar
