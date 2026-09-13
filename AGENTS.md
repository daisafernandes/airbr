# Agent instructions - Airbr

This file orients automated coding agents (Cursor, Codex, Claude Code, etc.) working in this repository. Prefer focused, local diffs that match existing patterns. Do not refactor unrelated code, rename things for taste, or add documentation unless the user asked for it.

## What this is

Airbr is a Turborepo monorepo: React (Vite + TypeScript) frontend, Node.js (Express + TypeScript + Prisma) backend, and PostgreSQL/PostGIS locally via Docker. Full layout and project context are in [README.md](README.md).

## Rule priority

1. Direct user instructions for the current task.
2. File-scoped rules in [.cursor/rules/](.cursor/rules/).
3. This repo-wide `AGENTS.md`.
4. Existing code patterns in the touched area.

When rules conflict, follow the higher-priority source and mention the conflict in your final note.

## Where rules live

- **Cursor file rules:** [.cursor/rules/frontend.mdc](.cursor/rules/frontend.mdc) and [.cursor/rules/backend.mdc](.cursor/rules/backend.mdc).
- **This file:** repo-wide expectations for any automated agent.
- **Package scripts:** root and workspace `package.json` files are the source of truth for runnable commands.

## Stack (short)

| Area | Stack |
|------|-------|
| Root | npm workspaces, Turbo, Node >= 24, TypeScript |
| Frontend | React 18, Vite, Tailwind, Radix, TanStack Query |
| Backend | Express, Prisma, Clean Architecture under `apps/backend/src/` |
| Data | PostgreSQL/PostGIS, Prisma migrations and seed |

## Commands (from repo root)

```bash
npm run dev
npm run build
npm run lint
npm run test

# Scoped examples
npm run dev --filter=@airbr/frontend
npm run dev --filter=@airbr/backend
npm run lint --filter=@airbr/frontend
npm run lint --filter=@airbr/backend
npm run test --filter=@airbr/frontend
npm run test --filter=@airbr/backend
```

Copy env examples before first run:

```bash
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
```

Never commit populated `.env` files or secrets.

## Architecture guardrails

**Backend:** Dependencies flow inward: `infrastructure` -> `application` -> `domain`.

- Domain stays pure: entities, value objects, repository interfaces, and business invariants only.
- Application services implement use cases and depend on domain contracts, not concrete infrastructure.
- Infrastructure owns Express controllers/routes, database implementations, providers, config, and external services.
- Controllers should parse HTTP input, call services, and shape HTTP responses. Business decisions belong in services/domain.
- Repository interfaces live in `domain/repositories/`; concrete Prisma implementations live in `infrastructure/database/repositories/`.
- New providers need an abstraction at the inner layer before adding the concrete implementation.

**Frontend:** API and side effects should stay out of page components.

- API calls go through `apps/frontend/src/services/`.
- Pages in `pages/` stay route-focused and thin.
- Shared UI belongs in `components/ui/`, `components/layout/`, or `components/shared/` according to scope.
- Reusable stateful logic goes in `hooks/`; pure helpers go in `utils/`.
- Prefer existing Radix/Tailwind/component patterns before introducing new UI primitives.

## Change discipline

- Read neighboring files before editing; match naming, imports, validation, error handling, and test style.
- Keep diffs scoped to the requested behavior. Avoid opportunistic formatting, dependency upgrades, or drive-by cleanup.
- Do not revert, delete, regenerate, or move files you did not intentionally change for the task.
- Treat a dirty worktree as user-owned work. If unrelated changes exist, ignore them; if they block the task, ask before proceeding.
- Use structured parsers/APIs for structured data when practical; avoid brittle text munging for JSON, Prisma schema, or config.
- Add dependencies only when the existing stack cannot reasonably solve the problem. Explain why in the final note.
- Preserve public API contracts unless the user explicitly asked for a breaking change.

## Database and migrations

- Do not edit old migration files that may already be applied. Add a new migration for schema changes unless the user explicitly says the branch can be squashed/reset.
- Keep Prisma schema changes, migrations, repository code, DTOs, and tests aligned.
- Avoid `db:push` for durable schema changes unless the user asked for prototyping only.
- Do not drop data, reset databases, or run destructive migration commands without explicit approval.

## Validation expectations

Run the smallest meaningful checks for the touched area:

| Change | Minimum check |
|--------|---------------|
| Frontend code | `npm run lint --filter=@airbr/frontend` |
| Backend code | `npm run lint --filter=@airbr/backend` |
| Shared/root config | relevant scoped lint/build, or root `npm run lint` |
| Non-trivial behavior | relevant tests with `npm run test --filter=@airbr/<package>` |
| Type/interface changes | relevant build with `npm run build --filter=@airbr/<package>` |

If a check cannot run because dependencies, env, Docker, or network are missing, state that clearly and include the exact command attempted.

## Security and config

- Never print or commit secrets. Redact tokens, API keys, database URLs with credentials, JWT secrets, and private webhook values.
- Keep env documentation in `.env.example` synchronized when adding required env vars.
- Validate external input at the boundary with the existing validation style.
- Preserve existing CORS, rate-limit, auth, and proxy/security behavior unless the task is specifically about changing it.
- Be careful with logs: avoid logging credentials, tokens, raw auth headers, or sensitive user data.

## Testing patterns

- Prefer focused unit tests for pure services, mappers, validation, and domain behavior.
- Use integration tests when behavior crosses HTTP, database repositories, auth, or job orchestration.
- Frontend tests should exercise user-visible behavior rather than implementation details.
- When fixing a bug, add or update a regression test if the repo already has a nearby test pattern.

## Useful paths

| Path | Purpose |
|------|---------|
| `apps/backend/prisma/` | Schema, migrations, seed |
| `apps/backend/src/application/services/` | Backend use case implementations |
| `apps/backend/src/domain/` | Domain entities, contracts, value objects |
| `apps/backend/src/infrastructure/` | HTTP, database, providers, config |
| `apps/backend/src/jobs/` | Collectors and scheduled work |
| `apps/frontend/src/services/` | Frontend API client layer |
| `apps/frontend/src/pages/` | Route-mapped frontend pages |
| `packages/eslint-config/` | Shared ESLint config |
| `packages/typescript-config/` | Shared tsconfig bases |

When in doubt about placement or layering, follow [.cursor/rules/backend.mdc](.cursor/rules/backend.mdc), [.cursor/rules/frontend.mdc](.cursor/rules/frontend.mdc), and the closest existing implementation.
