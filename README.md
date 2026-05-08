# Airbr — Monorepo

Turborepo monorepo with a **React** (Vite + TypeScript) frontend and a **Node.js** (Express + TypeScript) backend, structured around **Clean Architecture** and **SOLID**.

**Stack highlights:** Turborepo · React 18 · Vite · Tailwind CSS · Radix UI · TanStack Query · Express · Prisma · PostgreSQL (PostGIS in local Docker).

## Repository layout

```
airbr/
├── apps/
│   ├── backend/              # Node.js + Express + TypeScript + Prisma
│   │   └── src/
│   │       ├── domain/       # Entities, interfaces, value objects (no external deps)
│   │       │   ├── entities/
│   │       │   ├── repositories/    # Interfaces (contracts)
│   │       │   ├── use-cases/       # IUseCase interface
│   │       │   └── value-objects/
│   │       ├── application/  # Use cases, DTOs, mappers (depends on domain only)
│   │       │   ├── dtos/
│   │       │   ├── mappers/
│   │       │   └── services/        # Use case implementations
│   │       ├── infrastructure/ # Concrete implementations (DB, HTTP, providers)
│   │       │   ├── config/
│   │       │   ├── database/
│   │       │   │   └── repositories/
│   │       │   ├── http/
│   │       │   │   ├── controllers/
│   │       │   │   ├── middlewares/
│   │       │   │   └── routes/
│   │       │   └── providers/
│   │       └── shared/       # Cross-cutting utilities
│   │           ├── errors/
│   │           ├── types/
│   │           └── utils/
│   └── frontend/             # React + Vite + TypeScript
│       └── src/
│           ├── assets/       # Images, fonts, icons
│           ├── components/
│           │   ├── ui/       # Base reusable components (Button, Input, …)
│           │   ├── layout/   # Layout shells (RootLayout, …)
│           │   └── shared/   # Components shared across features
│           ├── contexts/     # React contexts (e.g. auth)
│           ├── hooks/        # Custom hooks
│           ├── pages/        # Route-mapped pages
│           ├── services/     # API client layer
│           ├── styles/       # Global CSS
│           ├── types/        # TypeScript types and interfaces
│           └── utils/        # Pure helper functions
├── packages/
│   ├── eslint-config/        # Shared ESLint config
│   ├── typescript-config/    # Base tsconfig presets (Node, React)
│   └── ui/                   # (Reserved) shared UI package
├── docker-compose.yml        # Local PostgreSQL + PostGIS
├── package.json              # Root workspaces
└── turbo.json                # Turborepo pipeline
```

## Principles

### Clean Architecture (backend)

Dependencies always point inward:

```
Infrastructure → Application → Domain
```

- **Domain:** no external dependencies; pure business rules.
- **Application:** orchestrates use cases; depends only on the domain.
- **Infrastructure:** implements interfaces from the domain/application layers.

### SOLID

| Principle | How it shows up |
|-----------|-----------------|
| **S**RP | One responsibility per unit (`CreateUserService`, `UserMapper`, `UserController`, …) |
| **O**CP | Use cases and repositories extend via interfaces without modifying existing code |
| **L**SP | `InMemoryUserRepository` (or any repo impl.) is swappable behind `IUserRepository` |
| **I**SP | Small, focused interfaces (`IUserRepository`, `IHashProvider`, `IUseCase`) |
| **D**IP | Services depend on abstractions (`IUserRepository`), not concrete implementations |

## Prerequisites

- **Node.js** >= 24 (see root `package.json` `engines`)
- **npm** >= 10

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment files

Copy each app’s example env file and adjust values (especially `DATABASE_URL`, secrets, and API keys):

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

The frontend expects the API base URL (see `apps/frontend/.env.example`):

- `VITE_API_URL` — default `http://localhost:3333/api/v1`

The backend documents all variables in `apps/backend/.env.example` (Postgres, JWT, CORS, collectors, email, web push, admin API key, …).

### 3. Database (local)

Start PostgreSQL with PostGIS (matches the default URLs in `.env.example`):

```bash
docker compose up -d
```

Then apply migrations from the backend package:

```bash
npm run db:migrate --filter=@airbr/backend
```

Optional: seed or open Prisma Studio (see [Backend scripts](#backend-scripts)).

### 4. Run the apps

```bash
# All dev servers (Turbo)
npm run dev

# Backend only
npm run dev --filter=@airbr/backend

# Frontend only
npm run dev --filter=@airbr/frontend
```

## Root scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all `dev` tasks via Turborepo |
| `npm run build` | Production build for all packages/apps |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run tests in all workspaces |
| `npm run format` | Prettier write on `ts`, `tsx`, `js`, `json`, `md` |
| `npm run clean` | Turbo `clean` + remove root `node_modules` |

Filter to one app: append `--filter=@airbr/backend` or `--filter=@airbr/frontend`.

## Backend scripts

Run with `npm run <script> --filter=@airbr/backend` from the repo root, or `cd apps/backend && npm run <script>`.

| Script | Description |
|--------|-------------|
| `dev` | `tsx watch` on the API |
| `build` | TypeScript compile + path aliases |
| `start` | Run compiled `dist/main.js` (after `build`) |
| `test` / `test:watch` / `test:cov` | Jest |
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:push` | `prisma db push` (prototyping) |
| `db:seed` | Run `prisma/seed.ts` |
| `db:studio` | Prisma Studio |
| `import:municipalities` | Municipality import script |
| `validate:collectors-env` | Validate collector-related env |

## Frontend scripts

Run with `npm run <script> --filter=@airbr/frontend` or from `apps/frontend`.

| Script | Description |
|--------|-------------|
| `dev` | Vite dev server |
| `build` | Typecheck + Vite production build |
| `preview` | Preview production build |
| `test` / `test:watch` / `test:cov` | Vitest |
| `test:e2e` / `test:e2e:ui` | Playwright |

## Ports

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:3333 |

## API security (backend)

- **`ADMIN_API_KEY`:** protects `GET /api/v1/admin/jobs` and `POST /api/v1/admin/jobs/run`. Required in production. Send `Authorization: Bearer <key>` or `X-Admin-Key: <key>`.
- The server uses **Helmet**, **rate limiting** on `/api/v1` (stricter on `/api/v1/admin`), and a **256KB** JSON body limit.
- In production, **`trust proxy`** is enabled (`1`) so rate limiting sees the real client IP behind a reverse proxy; enable only when you trust that proxy.

## Environment overview

For full lists and comments, use the `.env.example` files in each app. Notable backend areas:

- **Core:** `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `FRONTEND_URL`, `DATABASE_URL`, `DIRECT_URL` (direct DB URL for Prisma migrations, e.g. Neon non-pooler).
- **Auth:** `JWT_SECRET`, `JWT_EXPIRES_IN`.
- **Air quality / data collectors (optional keys):** `OWM_API_KEY`, `AQICN_TOKEN`, `CETESB_*`, `IEMA_API_KEY`, `IAT_API_KEY`, and related notes in `.env.example`.
- **Email / push:** Resend or SMTP, `EMAIL_FROM`, VAPID keys for web push, `ALERT_COOLDOWN_HOURS`.

Job scheduling and collector behavior are documented inline in `apps/backend/.env.example`.
