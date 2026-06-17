# Fase 3 — Frontend: UI Core y Vista del Álbum

## Objetivo
Interfaz principal funcionando: el usuario puede ver el álbum completo organizado por secciones, navegar entre equipos y ver el estado de cada figurita con datos reales de la API.

---

## Layout general

```
┌────────────────────────────────────────────┐
│  HEADER: Logo + "Mundial 2026" + progreso  │
│          [███████░░░] 342/1010 (33.8%)     │
├───────────┬────────────────────────────────┤
│  SIDEBAR  │  CONTENIDO PRINCIPAL           │
│           │                                │
│ ▸ Intro   │  [Vista del álbum]             │
│ ▸ Equipos │                                │
│   CONMB   │                                │
│   UEFA    │                                │
│   ...     │                                │
│ ▸ Especial│                                │
└───────────┴────────────────────────────────┘
```

En mobile: sidebar colapsa en un menú hamburguesa/drawer.

---

## Componentes a crear

### Layout
- `AppLayout` — wrapper con header + sidebar + main
- `Header` — logo, barra de progreso global, ícono de estadísticas
- `Sidebar` — navegación por secciones agrupadas por confederación
- `ConfederationGroup` — acordeón colapsable con equipos de una confederación

### Vistas (pages / features)
- `AlbumView` — vista principal con grid de figuritas de la sección seleccionada
- `SectionHeader` — banner del equipo con bandera, nombre, progreso (X/20)
- `StickerGrid` — grid responsive de figuritas
- `StickerCard` — tarjeta individual de figurita
- `StatsView` — dashboard de estadísticas (Fase 4)

### UI atoms
- `ProgressBar` — barra de progreso reutilizable con color dinámico
- `BadgeStatus` — chip "Tengo" / "Falta" / "Duplicada"
- `SectionBadge` — bandera + nombre + % completitud en sidebar

---

## StickerCard — estados visuales

La tarjeta de figurita tiene 3 estados claramente diferenciados:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   #42       │  │ ✓ #42       │  │ ×2 #42      │
│             │  │             │  │             │
│  [imagen/   │  │  [imagen/   │  │  [imagen/   │
│   inicial]  │  │   inicial]  │  │   inicial]  │
│             │  │             │  │             │
│ L. Messi    │  │ L. Messi    │  │ L. Messi    │
│ ○ FALTA     │  │ ● TENGO     │  │ ● DUPLICADA │
└─────────────┘  └─────────────┘  └─────────────┘
  gris/opaco       color vivo        color + badge
```

Colores:
- Falta: `bg-slate-100 border-slate-200 opacity-60`
- Tengo: `bg-emerald-50 border-emerald-400`
- Duplicada (≥2): `bg-amber-50 border-amber-400` + badge con cantidad

Interacción al click: toggle entre falta (0) → tengo (1). Long press / botón "+" para duplicados.

---

## Hooks de datos

```typescript
// hooks/useSection.ts
function useSection(code: string) {
  return useQuery({
    queryKey: ['section', code],
    queryFn: () => api.get(`/sections/${code}`)
  })
}

// hooks/useCollectSticker.ts
function useCollectSticker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ number, quantity }) =>
      api.patch(`/stickers/${number}/collect`, { quantity }),
    onSuccess: (_, { number }) => {
      qc.invalidateQueries({ queryKey: ['section'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    }
  })
}

// hooks/useStats.ts
function useStats() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: () => api.get('/stats/overview')
  })
}
```

---

## Routing

```typescript
// App.tsx
<Routes>
  <Route path="/" element={<Navigate to="/album/INTRO" />} />
  <Route path="/album/:sectionCode" element={<AlbumView />} />
  <Route path="/stats" element={<StatsView />} />
  <Route path="/duplicates" element={<DuplicatesView />} />
</Routes>
```

---

## Paleta de colores / tema

Tema futbolero pero moderno:

```typescript
// tailwind.config.ts — extend colors
colors: {
  brand: {
    50: '#f0fdf4',
    500: '#22c55e',   // verde campo
    600: '#16a34a',
    900: '#14532d',
  },
  gold: {
    400: '#facc15',   // dorado copa
    500: '#eab308',
  }
}
```

Background principal: `bg-slate-50`
Cards: `bg-white` con sombra sutil
Header: `bg-brand-900` (verde oscuro) con texto blanco

---

## Criterio de aceptación
- [ ] Al abrir la app se ve la sección INTRO con sus figuritas
- [ ] El sidebar muestra todos los equipos agrupados por confederación
- [ ] Hacer click en un equipo navega a su sección
- [ ] Cada figurita muestra número, nombre y estado visual correcto
- [ ] Hacer click en una figurita la marca como "tengo" y actualiza el progreso
- [ ] El header muestra el progreso global actualizado en tiempo real
- [ ] La UI es responsive: funciona en móvil y desktop
