# Agent instructions — Airbr

This file orients automated coding agents (Cursor, Codex, Claude Code, etc.) working in this repository. Prefer **focused diffs** that match existing patterns; do not refactor unrelated code or add docs the user did not ask for.

## What this is

**Airbr** is a Turborepo monorepo: React (Vite + TypeScript) frontend, Node.js (Express + TypeScript + Prisma) backend, PostgreSQL/PostGIS locally via Docker. Full layout and principles are in [README.md](README.md).

## Where rules live

- **Always-on / file-scoped Cursor rules:** [.cursor/rules/](.cursor/rules/) — `frontend.mdc`, `backend.mdc` (directory layout, conventions, env copy, dev commands).
- **This file:** repo-wide expectations for any agent.

## Stack (short)

| Area | Stack |
|------|--------|
| Root | npm workspaces, Turbo, Node ≥ 24, TypeScript |
| Frontend | React 18, Vite, Tailwind, Radix, TanStack Query |
| Backend | Express, Prisma, Clean Architecture layers under `apps/backend/src/` |

## Commands (from repo root)

```bash
npm run dev          # all apps via turbo
npm run build
npm run lint
npm run test

# Scoped examples
npm run dev --filter=@airbr/frontend
npm run dev --filter=@airbr/backend
```

Copy env examples before first run: `apps/frontend/.env.example` → `apps/frontend/.env`, `apps/backend/.env.example` → `apps/backend/.env`.

## Architecture expectations

**Backend:** Dependencies flow **inward** — `infrastructure` → `application` → `domain`. New use cases in `application/services/`; repository interfaces in `domain/repositories/`, implementations in `infrastructure/database/repositories/`. Controllers orchestrate HTTP only.

**Frontend:** API calls go through `apps/frontend/src/services/`. Pages in `pages/` stay thin; hooks in `hooks/`; shared UI in `components/ui/`, `components/layout/`, `components/shared/` per existing rules.

## Agent behavior

- **Read before editing** — match naming, imports, and error handling style of neighboring code.
- **Run checks** when you change code — at least `npm run lint --filter=@airbr/<package>` for the package you touched; run tests when behavior is non-trivial.
- **Do not commit** secrets, generated cache-only noise, or unrelated formatting sweeps.
- **Documentation:** extend `README.md` or `docs/` only when the user (or task) explicitly asks for documentation changes.

## Useful paths

| Path | Purpose |
|------|---------|
| `apps/backend/prisma/` | Schema, migrations, seed |
| `apps/backend/src/jobs/` | Collectors / scheduled work |
| `packages/eslint-config/` | Shared ESLint |
| `packages/typescript-config/` | Shared tsconfig bases |

When in doubt about file placement or layering, follow [.cursor/rules/backend.mdc](.cursor/rules/backend.mdc) and [.cursor/rules/frontend.mdc](.cursor/rules/frontend.mdc).
