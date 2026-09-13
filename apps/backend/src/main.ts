import 'dotenv/config'

import { env } from '@infrastructure/config/env'

import { createApp } from './createApp'

const { app } = createApp()

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console -- startup banner
  console.warn(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
