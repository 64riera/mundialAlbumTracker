# Fase 5 — Polish: Estadísticas Avanzadas, Animaciones y UX Final

## Objetivo
La app se siente pulida, con estadísticas visuales atractivas, microanimaciones y detalles que hacen la experiencia memorable.

---

## Feature 1: Dashboard de Estadísticas

Ruta: `/stats`

### Layout
```
┌────────────────────────────────────────────────────┐
│  📊 Mis Estadísticas                               │
├──────────────┬─────────────┬───────────────────────┤
│  Total       │  Obtenidas  │  Faltan               │
│  1,010       │  342        │  668                  │
│              │  ████░░ 33% │                       │
├──────────────┴─────────────┴───────────────────────┤
│  Duplicadas: 47   Colecciones completas: 3 equipos │
├────────────────────────────────────────────────────┤
│  Progreso por Confederación                        │
│                                                    │
│  CONMEBOL  ████████░░ 78%  (88/112)               │
│  UEFA      ████░░░░░░ 42%  (134/320)              │
│  CONCACAF  ██████░░░░ 61%  (73/120)              │
│  CAF       ██░░░░░░░░ 23%  (41/180)              │
│  AFC       ███░░░░░░░ 31%  (50/160)              │
├────────────────────────────────────────────────────┤
│  Equipos completos  │  Más cerca de completar      │
│  🇦🇷 Argentina ✓   │  🇧🇷 Brasil 19/20           │
│  🇺🇸 EE.UU. ✓     │  🇲🇽 México 18/20            │
│  🇲🇽 México ✓     │  🇺🇾 Uruguay 17/20            │
└────────────────────────────────────────────────────┘
```

### Gráficos (usar Recharts)
1. **Donut chart** — proporción tengo/falta/duplicadas
2. **Bar chart horizontal** — progreso por confederación
3. **Grid de equipos** — cada equipo como celda con color según % completitud (heatmap)

### Implementación
- Instalar `recharts`
- Componentes: `OverviewCards`, `ConfederationChart`, `TeamCompletionGrid`, `RecentActivity`
- Datos: `GET /api/stats/overview` + `GET /api/stats/by-section`

---

## Feature 2: Animaciones y Microinteracciones

### Al marcar una figurita como obtenida
- La card hace un flip animado (CSS transform rotateY) revelando el estado "obtenida"
- Partículas/confetti mínimo si completan un equipo entero
- Usar `framer-motion` para las animaciones de cards

```typescript
// StickerCard con framer-motion
<motion.div
  whileTap={{ scale: 0.95 }}
  animate={{ opacity: isOwned ? 1 : 0.6 }}
  transition={{ duration: 0.2 }}
>
```

### Barra de progreso animada
- Al cargar la sección, la barra se anima de 0 al valor real
- Usar `animate` de framer-motion en el width

### Sidebar
- Al hacer hover sobre un equipo, muestra un tooltip con `X/20 figuritas`
- Transición suave al cambiar de sección (fade)

### Completar un equipo
- Modal de celebración con confetti cuando se coleccionan las 20 figuritas del equipo
- Usar `canvas-confetti`

---

## Feature 3: Modo "Intercambio"

Lista exportable y compartible optimizada para WhatsApp/Telegram.

### UX
Botón en la vista de duplicados → genera un mensaje formateado:

```
🏆 Álbum Mundial 2026 - Mis duplicadas

🇦🇷 Argentina: #42 (Messi) ×2
🇧🇷 Brasil: #87 (Vinicius) ×3, #91 (Rodrygo) ×2

¿Tienes alguna de mi lista de faltantes?
Faltan: #12, #33, #67, #89...
```

---

## Feature 4: Persistencia y Backup

### Export/Import
- Botón "Exportar mis datos" → descarga `album-mundial-2026-backup.json`
- Botón "Importar" → carga un JSON y actualiza la DB vía bulk endpoint

Formato JSON:
```json
{
  "exportDate": "2026-06-16",
  "stickers": [
    { "number": 42, "quantity": 1 },
    { "number": 87, "quantity": 2 }
  ]
}
```

---

## Feature 5: PWA básico

Hacer la app instalable en móvil:
- `vite-plugin-pwa` con manifest básico
- Ícono de la app (balón de fútbol + trofeo)
- Nombre: "Mundial 2026"
- Cacheo offline de la app shell (el contenido sigue requiriendo conexión local)

---

## Feature 6: Filtros avanzados en el álbum

En la vista del álbum principal, agregar filtros rápidos:

```
[Todas] [Tengo] [Falta] [Duplicadas] [Brillantes ⭐]
```

Implementar como botones toggle que filtran el grid client-side sin llamadas extra a la API.

---

## Detalles visuales finales

- Favicon: trofeo FIFA 🏆
- `<title>` dinámico: "Argentina | Mundial 2026 Album"
- Meta OG tags para compartir
- Loading skeletons (shadcn Skeleton) en vez de spinners
- Empty states ilustrados (cuando un filtro no tiene resultados)
- Tooltip en cada sticker card al hacer hover con info completa

---

## Criterio de aceptación
- [ ] Dashboard de estadísticas muestra todos los gráficos con datos reales
- [ ] Marcar una figurita tiene animación fluida
- [ ] Completar un equipo muestra celebración con confetti
- [ ] Export/Import de datos funciona correctamente
- [ ] La app es instalable como PWA en móvil
- [ ] Los filtros de álbum funcionan sin llamadas extra a la API
- [ ] Performance: Lighthouse score > 85 en todas las categorías
