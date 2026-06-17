# Fase 2 — Backend: API REST, Base de Datos y Seed

## Objetivo
API completamente funcional con todos los datos del álbum FIFA World Cup 2026 sembrados en la DB. El frontend puede consumir figuritas, secciones y estadísticas.

---

## Modelo de datos (Prisma)

```prisma
model Section {
  id          String    @id @default(cuid())
  code        String    @unique  // "ARG", "INTRO", "STADIUMS"
  name        String              // "Argentina", "Introducción"
  type        SectionType         // TEAM | INTRO | SPECIAL
  flagEmoji   String?
  confederation String?           // UEFA, CONMEBOL, etc.
  order       Int                 // orden de aparición en el álbum
  stickers    Sticker[]
  createdAt   DateTime  @default(now())
}

enum SectionType {
  INTRO
  TEAM
  SPECIAL
}

model Sticker {
  id          String    @id @default(cuid())
  number      Int       @unique  // número en el álbum (1..700+)
  name        String              // "Lionel Messi", "Escudo Argentina"
  type        StickerType
  isShiny     Boolean   @default(false)
  sectionId   String
  section     Section   @relation(fields: [sectionId], references: [id])
  userSticker UserSticker?
  createdAt   DateTime  @default(now())

  @@index([sectionId])
}

enum StickerType {
  PLAYER
  BADGE
  STADIUM
  GROUP
  SPECIAL
  INTRO
}

model UserSticker {
  id        String   @id @default(cuid())
  stickerId String   @unique
  sticker   Sticker  @relation(fields: [stickerId], references: [id])
  quantity  Int      @default(0)  // 0=falta, 1=tengo, 2+=duplicado
  updatedAt DateTime @updatedAt
}
```

---

## Endpoints API

Base URL: `http://localhost:3001/api`

### Secciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/sections` | Lista todas las secciones con progreso |
| GET | `/sections/:code` | Detalle de sección + sus figuritas |

### Figuritas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/stickers` | Lista con filtros: `?sectionId=&status=missing\|owned\|duplicate` |
| GET | `/stickers/:number` | Detalle de una figurita por número |
| PATCH | `/stickers/:number/collect` | Body: `{ quantity: number }` — marca como obtenida |
| POST | `/stickers/bulk-collect` | Body: `{ numbers: number[] }` — agregar varias de una vez |

### Estadísticas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/stats/overview` | Total, obtenidas, faltantes, duplicados, % completitud |
| GET | `/stats/by-section` | Progreso por sección |
| GET | `/stats/duplicates` | Lista de figuritas duplicadas |

---

## Seed de datos — FIFA World Cup 2026

El álbum Panini 2026 tiene 48 equipos. Estructura del seed:

### Secciones especiales (INTRO / SPECIAL)
- `INTRO`: Páginas introductorias (stickers 1–20)
- `VENUES`: Estadios sede (stickers 21–40) — 16 estadios en USA/CAN/MEX
- `TROPHIES`: Copa y símbolos FIFA (stickers 41–50)

### 48 equipos divididos por confederación

**CONMEBOL (6 equipos):**
Argentina 🇦🇷, Brasil 🇧🇷, Uruguay 🇺🇾, Colombia 🇨🇴, Ecuador 🇪🇨, Venezuela 🇻🇪

**UEFA (16 equipos):**
España 🇪🇸, Francia 🇫🇷, Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿, Alemania 🇩🇪, Portugal 🇵🇹, Países Bajos 🇳🇱, Bélgica 🇧🇪, Italia 🇮🇹, Croatia 🇭🇷, Serbia 🇷🇸, Eslovaquia 🇸🇰, Eslovenia 🇸🇮, Austria 🇦🇹, Suiza 🇨🇭, Escocia 🏴󠁧󠁢󠁳󠁣󠁴󠁿, Ucrania 🇺🇦

**CONCACAF (6 equipos):**
Estados Unidos 🇺🇸, México 🇲🇽, Canadá 🇨🇦, Panamá 🇵🇦, Costa Rica 🇨🇷, Jamaica 🇯🇲

**CAF (9 equipos):**
Marruecos 🇲🇦, Senegal 🇸🇳, Egipto 🇪🇬, Nigeria 🇳🇬, Camerún 🇨🇲, Mali 🇲🇱, Rep. Dem. Congo 🇨🇩, Sudáfrica 🇿🇦, Tanzania 🇹🇿

**AFC (8 equipos):**
Japón 🇯🇵, Corea del Sur 🇰🇷, Arabia Saudita 🇸🇦, Australia 🇦🇺, Irán 🇮🇷, Uzbekistán 🇺🇿, Jordania 🇯🇴, Iraq 🇮🇶

**OFC (1 equipo):**
Nueva Zelanda 🇳🇿

**Inter-confederaciones (2 equipos):**
2 equipos de los playoff inter-confederaciones (placeholder hasta que se definan)

### Estructura por equipo (20 stickers por equipo)
```
- 1 × Escudo (BADGE)
- 1 × Fotografía grupal del equipo (SPECIAL)
- 18 × Jugadores (PLAYER) — nombre del jugador
```

Total estimado: 50 (intro) + (48 × 20) = **1,010 figuritas**

### Implementación del seed
Crear `backend/prisma/seed.ts` con:
1. Array de secciones con todos los equipos
2. Función que genera stickers por equipo usando los datos
3. Crear `UserSticker` con `quantity: 0` para cada sticker (estado inicial: falta)
4. Usar `upsert` para que el seed sea idempotente

---

## Servicios a implementar

### `StickerService`
```typescript
class StickerService {
  findAll(filters: StickerFilters): Promise<StickerWithStatus[]>
  findByNumber(number: number): Promise<StickerWithStatus>
  updateQuantity(number: number, quantity: number): Promise<UserSticker>
  bulkCollect(numbers: number[]): Promise<{ updated: number }>
}
```

### `StatsService`
```typescript
class StatsService {
  getOverview(): Promise<OverviewStats>
  getBySection(): Promise<SectionStats[]>
  getDuplicates(): Promise<StickerWithStatus[]>
}
```

---

## Criterio de aceptación
- [ ] `GET /api/sections` retorna 51+ secciones con % de progreso
- [ ] `GET /api/stickers?status=missing` retorna todos los stickers (cantidad 0)
- [ ] `PATCH /api/stickers/42/collect` con `{ quantity: 1 }` actualiza el estado
- [ ] `GET /api/stats/overview` muestra 0 obtenidas, 1010 faltantes inicialmente
- [ ] Seed es idempotente (correrlo dos veces no duplica datos)
