# Mundial Album Tracker — CLAUDE.md

## Qué es este proyecto

Web app para trackear el álbum Panini del FIFA World Cup 2026. Permite marcar figuritas obtenidas, registrar duplicados y ver estadísticas de completitud por sección/equipo.

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Estado/Fetch | TanStack Query v5 + Zustand |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL 16 |
| Infra local | Docker + docker-compose |

## Estructura de carpetas

```
mundialAlbumTracker/
├── CLAUDE.md
├── docker-compose.yml
├── docs/                    # Fases de desarrollo
│   ├── PHASE_1_SETUP.md
│   ├── PHASE_2_BACKEND.md
│   ├── PHASE_3_FRONTEND_CORE.md
│   ├── PHASE_4_FEATURES.md
│   └── PHASE_5_POLISH.md
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── features/        # Módulos de features (álbum, estadísticas, etc.)
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilidades, clientes API
│   │   ├── store/           # Zustand stores
│   │   └── types/           # Tipos TypeScript compartidos
│   └── ...
└── backend/
    ├── Dockerfile
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts          # Datos del álbum 2026
    └── src/
        ├── routes/          # Express routers (un archivo por recurso)
        ├── services/        # Lógica de negocio
        ├── middleware/      # Error handling, validación
        └── lib/             # DB client, utils
```

## Convenciones de código

### General
- TypeScript estricto en ambos lados (`strict: true`)
- Sin `any` implícito; usar `unknown` y narrowing
- Nombres en inglés para variables/funciones; UI en español

### Backend
- Un router por recurso: `stickers.router.ts`, `stats.router.ts`
- Servicios separados de los routers (SOLID: SRP)
- Validación de entrada con Zod en cada endpoint
- Errores siempre con `next(err)` → middleware central de errores
- Variables de entorno tipadas en `src/lib/env.ts`

### Frontend
- Componentes en `PascalCase`, hooks en `camelCase` con prefijo `use`
- Un componente por archivo; sin lógica de negocio en componentes de UI
- Llamadas API encapsuladas en custom hooks (`useStickers`, `useStats`)
- TanStack Query para server state; Zustand solo para UI state local

### Docker
- `docker-compose up` levanta todo (db + backend + frontend)
- Hot reload en dev para frontend y backend
- Un `.env.example` en cada carpeta; nunca commitear `.env`

## Modelo de datos central

```
Section (sección del álbum: equipo, intro, estadios)
  └── Sticker (figurita individual)
        └── UserSticker (cantidad que tiene el usuario: 0 = falta, 1+ = tiene, 2+ = duplicado)
```

## Puertos locales

| Servicio | Puerto |
|----------|--------|
| Frontend | 5173 |
| Backend | 3001 |
| PostgreSQL | 5432 |

## Comandos útiles

```bash
# Levantar todo
docker-compose up

# Solo backend (para desarrollo)
cd backend && npm run dev

# Solo frontend
cd frontend && npm run dev

# Migraciones
cd backend && npx prisma migrate dev

# Seed de datos
cd backend && npx prisma db seed
```

## Fases de desarrollo

Leer los docs en orden:
1. `docs/PHASE_1_SETUP.md` — Infraestructura Docker + scaffolding
2. `docs/PHASE_2_BACKEND.md` — API REST + DB + seed datos
3. `docs/PHASE_3_FRONTEND_CORE.md` — UI base + álbum principal
4. `docs/PHASE_4_FEATURES.md` — Agregar figuritas, duplicados, búsqueda
5. `docs/PHASE_5_POLISH.md` — Estadísticas avanzadas, animaciones, UX
