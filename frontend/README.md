# Frontend — Mundial 2026 Album Tracker

SPA con React 18 + TypeScript + Vite + Tailwind CSS.

## Setup

```bash
npm install
npm run dev     # http://localhost:5173
```

## Scripts

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Dev server con HMR |
| `npm run build` | Type-check + build produccion |
| `npm run preview` | Preview del build |
| `npm test` | Correr tests |
| `npm run test:coverage` | Tests con reporte de cobertura |

## Arquitectura

```
src/
├── features/               # Modulos por feature
│   ├── album/              # AlbumView, Sidebar, Header, StickerCard, StickerGrid, FilterBar
│   ├── auth/               # LoginPage, RegisterPage, AuthLayout, AuthInput
│   ├── stats/              # StatsView (dashboard principal)
│   ├── duplicates/         # DuplicatesView
│   ├── import/             # ImportPage (QR + paste)
│   ├── compare/            # ComparePage, CompareResults (trade finder)
│   └── quickadd/           # QuickAddDrawer, QuickAddFAB
├── components/
│   ├── MobileNav.tsx       # Bottom nav con liquid glass
│   ├── ProtectedRoute.tsx  # Auth guard
│   └── ui/                 # ProgressBar, Toast, ThemeToggle, LangToggle
├── hooks/                  # Custom hooks (useAuth, useStickers, useSections, useStats, useCompare, useImport)
├── store/                  # Zustand stores
│   ├── authStore.ts        # User + accessToken (persisted)
│   ├── uiStore.ts          # Sidebar, filters, drawers
│   └── themeStore.ts       # Light/dark/system (persisted)
├── lib/
│   ├── api.ts              # Axios con interceptors (auth + refresh)
│   ├── i18n/               # ES/EN traducciones + useT() hook + langStore
│   ├── confetti.ts         # canvas-confetti presets
│   ├── importParser.ts     # Parser flexible de codigos QR/texto
│   └── utils.ts            # cn() (clsx + tailwind-merge)
└── types/                  # Interfaces TypeScript compartidos
```

## Patrones clave

- **TanStack Query** para server state, **Zustand** solo para UI state
- **Feature folders** — cada feature es autocontenida con sus componentes
- **Custom hooks** encapsulan toda llamada API (SRP)
- **i18n sin dependencias** — Zustand store + diccionarios tipados + `useT()` hook
- **AuthInput** — componente reutilizable para todos los inputs de auth (DRY)

## Tests

67 tests totales (40 frontend). Cobertura 100% en stores, utils, parser, confetti, i18n.

```bash
npm run test:coverage
```
