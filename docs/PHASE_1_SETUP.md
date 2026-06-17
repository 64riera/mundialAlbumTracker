# Fase 1 — Infraestructura y Scaffolding

## Objetivo
Dejar el proyecto corriendo con `docker-compose up` mostrando una pantalla inicial en el frontend y el backend respondiendo `/health`.

---

## Tareas

### 1.1 — docker-compose.yml raíz
Crear `docker-compose.yml` en la raíz con tres servicios:
- **db**: `postgres:16-alpine`, volumen persistente, healthcheck
- **backend**: build desde `./backend`, depende de `db` (condición healthy), monta `./backend/src` para hot reload
- **frontend**: build desde `./frontend`, depende de `backend`, monta `./frontend/src`

Variables de entorno mínimas:
```
POSTGRES_USER=mundial
POSTGRES_PASSWORD=mundial
POSTGRES_DB=mundial_album
DATABASE_URL=postgresql://mundial:mundial@db:5432/mundial_album
```

### 1.2 — Backend scaffold
Inicializar `./backend` con:
- `npm init -y`
- TypeScript + ts-node-dev + Express + Prisma + Zod + cors + dotenv
- `tsconfig.json` con `strict: true`, `target: ES2022`, `outDir: dist`
- `nodemon.json` o `ts-node-dev` para hot reload
- Estructura de carpetas: `src/routes/`, `src/services/`, `src/middleware/`, `src/lib/`
- `src/index.ts` con Express básico
- Endpoint `GET /health` que responde `{ status: "ok", ts: Date.now() }`
- `Dockerfile` multistage: dev usa ts-node-dev, prod compila y corre dist

### 1.3 — Frontend scaffold
Inicializar `./frontend` con:
- Vite + React + TypeScript: `npm create vite@latest . -- --template react-ts`
- Tailwind CSS v3 + shadcn/ui (init con tema neutro)
- TanStack Query v5 + Zustand + React Router v6 + Axios
- Estructura de carpetas: `src/components/ui/`, `src/features/`, `src/hooks/`, `src/lib/`, `src/store/`, `src/types/`
- `src/lib/api.ts`: Axios instance apuntando a `http://localhost:3001`
- `Dockerfile` para dev: usa `node:20-alpine`, expone 5173, usa `vite --host`
- Página principal placeholder con el nombre de la app

### 1.4 — Variables de entorno
- `backend/.env.example` con todas las vars necesarias
- `frontend/.env.example` con `VITE_API_URL=http://localhost:3001`
- `.gitignore` en raíz que excluya `.env`, `node_modules`, `dist`, `.prisma`

### 1.5 — Verificación
Correr `docker-compose up --build` y verificar:
- [ ] `http://localhost:5173` muestra la pantalla del frontend
- [ ] `http://localhost:3001/health` responde 200 con JSON
- [ ] Cambiar un archivo en `src/` recarga sin reiniciar el contenedor

---

## Archivos a crear

```
mundialAlbumTracker/
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts
│       ├── lib/
│       │   └── env.ts
│       └── middleware/
│           └── errorHandler.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── .env.example
    └── src/
        ├── main.tsx
        ├── App.tsx
        └── lib/
            └── api.ts
```

---

## Criterio de aceptación
`docker-compose up` levanta sin errores, hot reload funciona en ambos lados, `/health` responde OK.
