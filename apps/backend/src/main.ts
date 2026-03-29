import 'dotenv/config'

import express from 'express'

import { AqiService } from '@application/services/AqiService'
import { CityService } from '@application/services/CityService'
import { FireService } from '@application/services/FireService'
import { env } from '@infrastructure/config/env'
import { prisma } from '@infrastructure/database/prisma'
import { PrismaAqiRepository } from '@infrastructure/database/repositories/PrismaAqiRepository'
import { PrismaCityRepository } from '@infrastructure/database/repositories/PrismaCityRepository'
import { PrismaFireRepository } from '@infrastructure/database/repositories/PrismaFireRepository'
import { CityController } from '@infrastructure/http/controllers/CityController'
import { FireController } from '@infrastructure/http/controllers/FireController'
import { errorHandler } from '@infrastructure/http/middlewares/errorHandler'
import { buildRoutes } from '@infrastructure/http/routes'
import { AQICNCollector } from '@jobs/collectors/AQICNCollector'
import { INPEFiresCollector } from '@jobs/collectors/INPEFiresCollector'
import { OpenMeteoCollector } from '@jobs/collectors/OpenMeteoCollector'
import { OpenWeatherMapCollector } from '@jobs/collectors/OpenWeatherMapCollector'
import { JobScheduler } from '@jobs/JobScheduler'
import { Normalizer } from '@jobs/Normalizer'

const app = express()
app.use(express.json())

// Repositories
const cityRepository = new PrismaCityRepository()
const aqiRepository = new PrismaAqiRepository()
const fireRepository = new PrismaFireRepository()

// Services
const cityService = new CityService(cityRepository, aqiRepository)
const aqiService = new AqiService(aqiRepository)
const fireService = new FireService(fireRepository)

// Controllers
const cityController = new CityController(cityService, aqiService)
const fireController = new FireController(fireService)

// Health check (registered before main router to ensure priority)
app.get('/api/v1/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'connected' })
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' })
  }
})

// API routes
app.use('/api/v1', buildRoutes({ cityController, fireController }))

app.use(errorHandler)

// Data collectors & scheduler
const aqiCollectors = [
  new OpenWeatherMapCollector(cityRepository),
  new AQICNCollector(cityRepository),
  new OpenMeteoCollector(cityRepository),
]
const fireCollectors = [new INPEFiresCollector()]
const normalizer = new Normalizer(aqiCollectors, fireCollectors, aqiRepository, fireRepository)
const scheduler = new JobScheduler(normalizer)
scheduler.start()

const server = app.listen(env.PORT, () => {
  console.warn(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
})

async function shutdown() {
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
