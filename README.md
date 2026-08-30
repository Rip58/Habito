# Habitos Pro

Seguimiento de hábitos: registro diario, mapa de actividad por hábito y
cronómetro de sesiones de foco.

Next.js 15 (App Router) · React 19 · Prisma · PostgreSQL · Tailwind CSS.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # rellena DATABASE_URL y AUTH_SECRET
npx prisma db push        # crea las tablas
npm run dev
```

El primer acceso usa el PIN de `APP_PIN` (por defecto `0001`). Se guarda
hasheado en la tabla `settings` y a partir de ahí se cambia desde Ajustes.

## Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` | sí | Conexión a PostgreSQL |
| `AUTH_SECRET` | recomendada | Firma la cookie de sesión. Si falta se usa `DATABASE_URL` |
| `APP_PIN` | no | PIN inicial, solo en el primer arranque |

`.env` **no se commitea**. Está en `.gitignore`.

## Estructura

```
app/            Rutas y API (/api/v1/*)
components/     Componentes de UI
views/          Las tres pantallas: Overview, Focus, Settings
lib/            Cliente de API, Prisma, autenticación
prisma/         Esquema y seed
middleware.ts   Exige sesión en todo /api/v1/* salvo /api/v1/auth
```

## Autenticación

El PIN se valida en el servidor (PBKDF2) y devuelve una cookie de sesión
`httpOnly` firmada con HMAC. El middleware rechaza con 401 cualquier llamada a
`/api/v1/*` sin sesión válida. Cinco intentos fallidos bloquean el acceso 15
minutos.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera cliente Prisma, sella la versión y compila |
| `npm start` | Sirve el build |
