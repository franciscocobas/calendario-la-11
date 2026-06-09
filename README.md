# Calendario La 11

Calendario de eventos escolares para la Escuela N° 11. Permite a los administradores gestionar eventos y a los padres/alumnos verlos en un calendario público.

## Stack

- **Next.js** con App Router y React 19
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Drizzle ORM** + **PostgreSQL** (Neon serverless)
- **Better Auth** para autenticación email/password
- **shadcn/ui** (estilo "new-york", colores neutral)
- **date-fns** con locale español

## Comenzar

```bash
pnpm install
pnpm dev      # servidor dev en localhost:3000
```

## Variables de entorno

Crear un archivo `.env.local` con:

```
DATABASE_URL=          # PostgreSQL connection string (Neon)
BETTER_AUTH_URL=       # URL base para autenticación
BETTER_AUTH_SECRET=    # Secret para Better Auth
```

## Comandos

```bash
pnpm dev      # servidor de desarrollo
pnpm build    # build de producción
pnpm start    # servidor de producción
pnpm lint     # ESLint
```

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Calendario con lista de próximos eventos |
| `/login` | Público | Login de administradores |
| `/admin` | Protegido | CRUD de eventos |

## Tipos de evento

| Tipo | Color |
|------|-------|
| Académico | Azul |
| Reunión | Ámbar |
| Social | Verde |
| Deporte | Rojo |
| Venta de Merienda | Naranja |
