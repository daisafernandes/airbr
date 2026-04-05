import 'dotenv/config'

import { formatCollectorEnvSummary, getCollectorEnvSummary } from '@infrastructure/config/collectorEnv'
import { env } from '@infrastructure/config/env'
import { prisma } from '@infrastructure/database/prisma'
import { JobScheduler } from '@jobs/JobScheduler'

import { createApp } from './createApp'

const { app, normalizer, alertChecker } = createApp()

// eslint-disable-next-line no-console -- startup diagnostics for collectors / Normalizer wiring
console.warn(formatCollectorEnvSummary(getCollectorEnvSummary()))

const scheduler = new JobScheduler(normalizer, alertChecker)
scheduler.start()

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console -- startup banner
  console.warn(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
})

async function shutdown() {
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
