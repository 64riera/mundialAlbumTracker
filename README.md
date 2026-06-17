# Mundial 2026 Album Tracker

Web app para trackear tu album Panini del FIFA World Cup 2026. Marca figuritas obtenidas, registra duplicados, compara con amigos e importa desde la app Figuritas via QR.

## Features

- **Album completo** — 961 figuritas organizadas por seccion y confederacion
- **Registro por codigo** — Busqueda con autocomplete, registro individual o masivo
- **Duplicados** — Conteo de sobrantes con lista exportable al portapapeles
- **Estadisticas** — Dashboard con progreso global, por confederacion, equipos completos
- **Importar album** — Escanear QR de la app Figuritas o pegar codigos
- **Comparar albums** — Escanear QR de un amigo y ver intercambios posibles
- **Confetti** — Efecto visual al agregar figuritas
- **Auth seguro** — Registro/login con JWT, refresh tokens httpOnly, rate limiting
- **Multi-usuario** — Cada usuario tiene su propio album
- **i18n** — Espanol e ingles con toggle persistente
- **Dark mode** — Claro, oscuro o seguir al sistema
- **Mobile-first** — Sidebar overlay, bottom nav con liquid glass, responsive completo

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand |
| Backend | Node.js, Express, TypeScript, Zod |
| ORM/DB | Prisma, PostgreSQL 16 |
| Auth | JWT (access + refresh), bcrypt, helmet, express-rate-limit |
| Testing | Vitest, @testing-library/react |
| Infra | Docker, docker-compose |

## Quick Start

```bash
# 1. Clonar
git clone <repo-url>
cd mundialAlbumTracker

# 2. Copiar variables de entorno
cp backend/.env.example backend/.env

# 3. Levantar todo con Docker
docker compose up --build

# 4. Abrir en el navegador
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

La primera vez, el backend ejecuta migraciones y seed automaticamente (961 figuritas).

## Desarrollo local (sin Docker)

```bash
# Terminal 1 — Base de datos
docker compose up db

# Terminal 2 — Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev                   # http://localhost:3001

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

## Tests

```bash
# Backend (27 tests)
cd backend && npm run test:coverage

# Frontend (40 tests)
cd frontend && npm run test:coverage
```

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripcion | Default |
|----------|------------|---------|
| `DATABASE_URL` | Connection string PostgreSQL | — |
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno | `development` |
| `JWT_SECRET` | Secret para access tokens (min 32 chars) | — |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens (min 32 chars) | — |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Descripcion | Default |
|----------|------------|---------|
| `VITE_API_URL` | URL del backend | `http://localhost:3001` |

## API Endpoints

### Auth
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesion |
| POST | `/api/auth/refresh` | Renovar access token |
| POST | `/api/auth/logout` | Cerrar sesion |
| GET | `/api/auth/me` | Perfil del usuario |

### Stickers (requieren auth)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/stickers` | Listar figuritas (filtro: all/owned/missing/duplicate) |
| GET | `/api/stickers/search?q=` | Buscar por codigo o nombre |
| GET | `/api/stickers/:number` | Detalle de figurita |
| PATCH | `/api/stickers/:number/collect` | Actualizar cantidad |
| POST | `/api/stickers/bulk-collect` | Agregar varias por numero |
| POST | `/api/stickers/bulk-collect-codes` | Agregar varias por codigo |
| POST | `/api/stickers/import` | Importar album desde codigos |
| POST | `/api/stickers/compare` | Comparar con album de amigo |

### Sections & Stats (requieren auth)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/sections` | Todas las secciones con progreso |
| GET | `/api/sections/:code` | Detalle de seccion con figuritas |
| GET | `/api/stats/overview` | Estadisticas globales |
| GET | `/api/stats/by-section` | Estadisticas por seccion |
| GET | `/api/stats/duplicates` | Lista de duplicadas |

## Estructura del proyecto

```
mundialAlbumTracker/
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # User, Section, Sticker, UserSticker
│   │   ├── migrations/
│   │   └── seed.ts              # 961 figuritas del album 2026
│   └── src/
│       ├── routes/              # auth, sections, stickers, stats
│       ├── services/            # Logica de negocio
│       ├── middleware/          # Auth JWT, rate limiter, error handler
│       └── lib/                 # DB client, env validation
├── frontend/
│   └── src/
│       ├── features/            # album, auth, stats, duplicates, import, compare, quickadd
│       ├── components/          # MobileNav, ProtectedRoute, UI (Toast, ProgressBar, etc.)
│       ├── hooks/               # useAuth, useStickers, useSections, useStats, useCompare, useImport
│       ├── store/               # authStore, uiStore, themeStore (Zustand)
│       ├── lib/                 # api client, i18n, confetti, importParser, utils
│       └── types/               # TypeScript interfaces compartidos
└── docs/                        # Fases de desarrollo
```

## Puertos

| Servicio | Puerto host |
|----------|-------------|
| Frontend | 5173 |
| Backend | 3001 |
| PostgreSQL | 5433 |

## Licencia

Proyecto personal — uso privado.
