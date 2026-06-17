# Fase 4 — Features: Agregar Figuritas, Búsqueda y Duplicados

## Objetivo
El flujo principal está completo: el usuario puede agregar figuritas rápidamente por número, buscar, gestionar duplicados y ver qué le falta.

---

## Feature 1: Agregar por número (Quick Add)

Panel flotante o drawer accesible desde cualquier vista.

### UX
```
┌──────────────────────────────┐
│  ➕ Agregar figuritas         │
│                              │
│  Número: [____] [Agregar]    │
│                              │
│  O ingresar varios:          │
│  [42, 87, 123, 456, ...]     │
│  [Agregar todos]             │
│                              │
│  Últimas agregadas:          │
│  ✓ #42 Messi — Argentina     │
│  ✓ #87 Vinicius Jr — Brasil  │
└──────────────────────────────┘
```

### Comportamiento
- Input con validación: solo números 1–1100
- Si el sticker ya está en `quantity >= 1`, incrementa quantity (se convierte en duplicado)
- Después de agregar, muestra un toast con el nombre del sticker y sección
- El campo se limpia y queda listo para el siguiente número
- Soporta pegar una lista separada por comas/espacios para agregar múltiples

### Implementación
- Componente: `QuickAddDrawer` (shadcn Drawer)
- Botón flotante (FAB) en mobile: posición `fixed bottom-6 right-6`
- En desktop: panel en el sidebar inferior o botón en header
- Hook: `useBulkCollect` que llama `POST /api/stickers/bulk-collect`

---

## Feature 2: Búsqueda global

Buscador accesible con `Cmd+K` / `Ctrl+K` o ícono en el header.

### UX
- Modal tipo command palette (shadcn Command)
- Busca por: número de figurita, nombre del jugador, nombre del equipo
- Resultados muestran: número, nombre, sección, estado actual
- Click en resultado navega a la sección y hace scroll hasta la figurita
- Atajo de teclado para marcar como obtenida directamente desde resultados

### Implementación
- Componente: `SearchCommand` usando `cmdk` (ya incluido en shadcn)
- Búsqueda client-side: los datos ya están en el cache de React Query
- Selector de Zustand para acceder al cache sin re-fetch

---

## Feature 3: Vista de Duplicados

Página dedicada a gestionar el intercambio de figuritas.

### UX
```
┌─────────────────────────────────────┐
│  Duplicadas (47)                    │
│                                     │
│  [Copiar lista] [Exportar]          │
│                                     │
│  #42 Messi — Argentina    ×2  [−]  │
│  #87 Vinicius — Brasil    ×3  [−]  │
│  #156 Bellingham — Ing.   ×2  [−]  │
│  ...                                │
└─────────────────────────────────────┘
```

### Comportamiento
- Botón `[−]` disminuye quantity en 1 (si llega a 1, ya no es duplicado; si llega a 0, se muestra alerta de confirmación)
- "Copiar lista" genera texto para compartir por WhatsApp:
  ```
  Mis duplicadas del Mundial 2026 🏆
  #42 Messi, #87 Vinicius Jr, #156 Bellingham...
  ```
- "Exportar" descarga un JSON o CSV con la lista completa

### Implementación
- Ruta: `/duplicates`
- Datos: `GET /api/stats/duplicates`
- Hook: `useDecrementSticker` que llama `PATCH /api/stickers/:number/collect` con `quantity - 1`

---

## Feature 4: Vista "Qué me falta"

Lista filtrada de todas las figuritas que aún no tiene el usuario.

### UX
- Ruta: `/missing`
- Tabla o grid con número y nombre de figuritas faltantes
- Agrupadas por sección con totales
- Botón para copiar la lista (útil para pedir a amigos)
- Filtro rápido por confederación

### Implementación
- Datos: `GET /api/stickers?status=missing`
- Componente `MissingView` con agrupación client-side por sección

---

## Feature 5: Undo rápido (Toast con acción)

Cuando el usuario marca o desmarca una figurita, el toast incluye un botón "Deshacer" visible por 4 segundos.

```
┌──────────────────────────────────────┐
│ ✓ #42 Messi agregada    [Deshacer]  │
└──────────────────────────────────────┘
```

### Implementación
- shadcn Toast con action button
- Al hacer "Deshacer" llama `PATCH` con la cantidad anterior
- Usar `useRef` para guardar el valor anterior antes de mutar

---

## Criterio de aceptación
- [ ] Quick Add permite ingresar número y aparece el sticker marcado inmediatamente
- [ ] Pegar "42, 87, 123" en Quick Add agrega los 3 de una vez
- [ ] `Cmd+K` abre el buscador y los resultados son precisos
- [ ] La vista de duplicados lista correctamente las figuritas con quantity >= 2
- [ ] Copiar lista genera texto útil para WhatsApp
- [ ] El toast de "Deshacer" funciona correctamente
