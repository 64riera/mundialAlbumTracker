# Backend — Mundial 2026 Album Tracker

API REST con Express + TypeScript + Prisma + PostgreSQL.

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Scripts

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Servidor con hot reload (ts-node-dev) |
| `npm run build` | Compilar TypeScript |
| `npm start` | Ejecutar build de produccion |
| `npm test` | Correr tests |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run db:migrate` | Ejecutar migraciones Prisma |
| `npm run db:seed` | Poblar base de datos |
| `npm run db:reset` | Reset completo + re-seed |

## Arquitectura

```
src/
├── routes/          # Express routers — un archivo por recurso
│   ├── auth.router.ts
│   ├── sections.router.ts
│   ├── stickers.router.ts
│   └── stats.router.ts
├── services/        # Logica de negocio — separada de HTTP
│   ├── auth.service.ts
│   ├── sections.service.ts
│   ├── stickers.service.ts
│   └── stats.service.ts
├── middleware/
│   ├── auth.middleware.ts    # JWT verification, req.userId
│   ├── rateLimiter.ts        # General (100/min) + auth (10/15min)
│   └── errorHandler.ts       # ZodError, AppError, 500 fallback
├── lib/
│   ├── db.ts                 # PrismaClient singleton
│   └── env.ts                # Zod-validated environment
└── index.ts                  # App entry point
```

## Seguridad

- Passwords hasheados con bcrypt (12 salt rounds)
- JWT access tokens (15 min) + refresh tokens httpOnly cookie (7 dias)
- Rate limiting: 100 req/min general, 10 req/15min en auth
- Helmet para headers HTTP seguros
- CORS restringido al origen del frontend
- Validacion de input con Zod en todos los endpoints
- Body size limitado a 16kb

## Modelo de datos

```
User
├── id, email, passwordHash, firstName, lastName, phone
└── userStickers[]

Section
├── id, code (unique), name, type, flagEmoji, confederation, order
└── stickers[]

Sticker
├── id, number (unique), code (unique), name, type, isShiny, sectionId
└── userStickers[]

UserSticker
├── id, userId, stickerId, quantity
└── @@unique([userId, stickerId])
```

## Tests

67 tests totales (27 backend). Cobertura del middleware al 100%.

```bash
npm run test:coverage
```
