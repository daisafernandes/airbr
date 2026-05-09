<div align="center">

# Airbr

**Full-stack monorepo** — React (Vite + TypeScript) · Express · Prisma · PostgreSQL / PostGIS

Clean Architecture on the backend · Turborepo at the root

[![Node.js](https://img.shields.io/badge/node.js-%3E%3D24-417505?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)

</div>

---

## About

**Airbr** is a full-stack application for **air quality**: it aggregates readings from **multiple external data sources** (OpenWeather, AQICN, Brazilian agencies such as CETESB and IEMA, and others—see `apps/backend/.env.example`), stores them in **PostgreSQL with PostGIS**, and exposes a **REST API** built with Express and Prisma. **Scheduled jobs** pull and normalize data; optional **email** and **web push** support user alerts.

The **React** frontend maps stations and trends with **Leaflet**, charts, and a modern UI (Tailwind, Radix, TanStack Query). Users authenticate via **JWT**; administrators can run and inspect **jobs** through secured endpoints. The repo is optimized for **local development** (Docker Compose for the database) and **production-style** configuration (CORS, rate limits, proxy-aware security).

---

### Contents

[About](#about) · [Repository layout](#repository-layout) · [Principles](#principles) · [Prerequisites](#prerequisites) · [Getting started](#getting-started) · [Root scripts](#root-scripts) · [Backend scripts](#backend-scripts) · [Frontend scripts](#frontend-scripts) · [Ports](#ports) · [API security](#api-security-backend) · [Environment](#environment-overview)

---

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

**Stack highlights:** Turborepo · React 18 · Vite · Tailwind CSS · Radix UI · TanStack Query · Express · Prisma · PostgreSQL (PostGIS in local Docker).

---

## Principles

### Clean Architecture (backend)

Dependencies always point inward:

```
Infrastructure → Application → Domain
```

| Layer              | Role                                                      |
| ------------------ | --------------------------------------------------------- |
| **Domain**         | No external dependencies; pure business rules.            |
| **Application**    | Orchestrates use cases; depends only on the domain.       |
| **Infrastructure** | Implements interfaces from the domain/application layers. |

### SOLID

| Principle | How it shows up                                                                      |
| --------- | ------------------------------------------------------------------------------------ |
| **S**RP   | One responsibility per unit (`CreateUserService`, `UserMapper`, `UserController`, …) |
| **O**CP   | Use cases and repositories extend via interfaces without modifying existing code     |
| **L**SP   | `InMemoryUserRepository` (or any repo impl.) is swappable behind `IUserRepository`   |
| **I**SP   | Small, focused interfaces (`IUserRepository`, `IHashProvider`, `IUseCase`)           |
| **D**IP   | Services depend on abstractions (`IUserRepository`), not concrete implementations    |

---

## Prerequisites

| Requirement | Version                                    |
| ----------- | ------------------------------------------ |
| **Node.js** | ≥ 24 (see root `package.json` → `engines`) |
| **npm**     | ≥ 10                                       |

---

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

---

## Root scripts

| Command          | Description                                       |
| ---------------- | ------------------------------------------------- |
| `npm run dev`    | Start all `dev` tasks via Turborepo               |
| `npm run build`  | Production build for all packages/apps            |
| `npm run lint`   | Lint all workspaces                               |
| `npm run test`   | Run tests in all workspaces                       |
| `npm run format` | Prettier write on `ts`, `tsx`, `js`, `json`, `md` |
| `npm run clean`  | Turbo `clean` + remove root `node_modules`        |

Filter to one app: append `--filter=@airbr/backend` or `--filter=@airbr/frontend`.

---

## Backend scripts

Run with `npm run <script> --filter=@airbr/backend` from the repo root, or `cd apps/backend && npm run <script>`.

| Script                             | Description                                 |
| ---------------------------------- | ------------------------------------------- |
| `dev`                              | `tsx watch` on the API                      |
| `build`                            | TypeScript compile + path aliases           |
| `start`                            | Run compiled `dist/main.js` (after `build`) |
| `test` / `test:watch` / `test:cov` | Jest                                        |
| `db:generate`                      | `prisma generate`                           |
| `db:migrate`                       | `prisma migrate dev`                        |
| `db:push`                          | `prisma db push` (prototyping)              |
| `db:seed`                          | Run `prisma/seed.ts`                        |
| `db:studio`                        | Prisma Studio                               |
| `import:municipalities`            | Municipality import script                  |
| `validate:collectors-env`          | Validate collector-related env              |

---

## Frontend scripts

Run with `npm run <script> --filter=@airbr/frontend` or from `apps/frontend`.

| Script                             | Description                       |
| ---------------------------------- | --------------------------------- |
| `dev`                              | Vite dev server                   |
| `build`                            | Typecheck + Vite production build |
| `preview`                          | Preview production build          |
| `test` / `test:watch` / `test:cov` | Vitest                            |
| `test:e2e` / `test:e2e:ui`         | Playwright                        |

---

## Ports

| Service           | URL                   |
| ----------------- | --------------------- |
| Frontend (Vite)   | http://localhost:5173 |
| Backend (Express) | http://localhost:3333 |

---

## API security (backend)

- **`ADMIN_API_KEY`:** protects `GET /api/v1/admin/jobs` and `POST /api/v1/admin/jobs/run`. Required in production. Send `Authorization: Bearer <key>` or `X-Admin-Key: <key>`.
- The server uses **Helmet**, **rate limiting** on `/api/v1` (stricter on `/api/v1/admin`), and a **256KB** JSON body limit.
- In production, **`trust proxy`** is enabled (`1`) so rate limiting sees the real client IP behind a reverse proxy; enable only when you trust that proxy.

---

## Environment overview

For full lists and comments, use the `.env.example` files in each app. Notable backend areas:

- **Core:** `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `FRONTEND_URL`, `DATABASE_URL`, `DIRECT_URL` (direct DB URL for Prisma migrations, e.g. Neon non-pooler).
- **Auth:** `JWT_SECRET`, `JWT_EXPIRES_IN`.
- **Air quality / data collectors (optional keys):** `OWM_API_KEY`, `AQICN_TOKEN`, `CETESB_*`, `IEMA_API_KEY`, `IAT_API_KEY`, and related notes in `.env.example`.
- **Email / push:** Resend or SMTP, `EMAIL_FROM`, VAPID keys for web push, `ALERT_COOLDOWN_HOURS`.

Job scheduling and collector behavior are documented inline in `apps/backend/.env.example`.
