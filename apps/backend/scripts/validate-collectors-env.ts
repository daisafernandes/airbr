/**
 * Prints collector-related env status (tokens present/missing, DATASUS fallback flag).
 * Does not connect to the database. Run after: cp .env.example .env && fill tokens.
 *
 * Usage: npm run validate:collectors-env --workspace=@airbr/backend
 */
import 'dotenv/config'

import { formatCollectorEnvSummary, getCollectorEnvSummary } from '../src/infrastructure/config/collectorEnv'

// Re-parse is unnecessary — importing collectorEnv pulls env.ts which exits on invalid zod.
// eslint-disable-next-line no-console
console.log(formatCollectorEnvSummary(getCollectorEnvSummary()))
// eslint-disable-next-line no-console
console.log('\nNormalizer / JobScheduler: collectors are wired in createApp.ts + main.ts (JobScheduler).')
