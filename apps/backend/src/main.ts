import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { AqiService } from '@application/services/AqiService'
import { CityService } from '@application/services/CityService'
import { DeforestationService } from '@application/services/DeforestationService'
import { FireService } from '@application/services/FireService'
import { HealthService } from '@application/services/HealthService'
import { OutdoorSafetyService } from '@application/services/OutdoorSafetyService'
import { WindSmokeService } from '@application/services/WindSmokeService'
import { NodeCacheService } from '@infrastructure/cache/NodeCacheService'
import { env } from '@infrastructure/config/env'
import { prisma } from '@infrastructure/database/prisma'
import { PrismaAqiRepository } from '@infrastructure/database/repositories/PrismaAqiRepository'
import { PrismaCityRepository } from '@infrastructure/database/repositories/PrismaCityRepository'
import { PrismaDeforestationRepository } from '@infrastructure/database/repositories/PrismaDeforestationRepository'
import { PrismaFireRepository } from '@infrastructure/database/repositories/PrismaFireRepository'
import { PrismaHealthRepository } from '@infrastructure/database/repositories/PrismaHealthRepository'
import { PrismaJobLogRepository } from '@infrastructure/database/repositories/PrismaJobLogRepository'
import { PrismaMunicipalityRepository } from '@infrastructure/database/repositories/PrismaMunicipalityRepository'
import { AdminController } from '@infrastructure/http/controllers/AdminController'
import { CityController } from '@infrastructure/http/controllers/CityController'
import { DeforestationController } from '@infrastructure/http/controllers/DeforestationController'
import { FireController } from '@infrastructure/http/controllers/FireController'
import { errorHandler } from '@infrastructure/http/middlewares/errorHandler'
import { apiRateLimiter } from '@infrastructure/http/middlewares/rateLimit'
import { buildRoutes } from '@infrastructure/http/routes'
import { AQICNCollector } from '@jobs/collectors/AQICNCollector'
import { CETESBCollector } from '@jobs/collectors/CETESBCollector'
import { DATASUSCollector } from '@jobs/collectors/DATASUSCollector'
import { IATCollector } from '@jobs/collectors/IATCollector'
import { IBGECollector } from '@jobs/collectors/IBGECollector'
import { IEMACollector } from '@jobs/collectors/IEMACollector'
import { INPEFiresCollector } from '@jobs/collectors/INPEFiresCollector'
import { OpenMeteoCollector } from '@jobs/collectors/OpenMeteoCollector'
import { OpenWeatherMapCollector } from '@jobs/collectors/OpenWeatherMapCollector'
import { PRODESCollector } from '@jobs/collectors/PRODESCollector'
import { JobScheduler } from '@jobs/JobScheduler'
import { Normalizer } from '@jobs/Normalizer'

const app = express()

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()), credentials: true }))
app.use(express.json({ limit: '256kb' }))
app.use('/api/v1', apiRateLimiter)

// Cache
export const cacheService = new NodeCacheService()

// Repositories
const cityRepository = new PrismaCityRepository()
const aqiRepository = new PrismaAqiRepository()
const fireRepository = new PrismaFireRepository()
const municipalityRepository = new PrismaMunicipalityRepository()
const jobLogRepository = new PrismaJobLogRepository()
const deforestationRepository = new PrismaDeforestationRepository()
const healthRepository = new PrismaHealthRepository()

// Services
const cityService = new CityService(cityRepository, aqiRepository, cacheService)
const aqiService = new AqiService(aqiRepository, cacheService)
const fireService = new FireService(fireRepository, cacheService, municipalityRepository)
const windSmokeService = new WindSmokeService(aqiRepository, fireRepository, cacheService)
const outdoorSafetyService = new OutdoorSafetyService(aqiRepository, cacheService)
const healthService = new HealthService(healthRepository, aqiRepository, cityRepository, cacheService)
const deforestationService = new DeforestationService(deforestationRepository, cacheService)

const aqiCollectors = [
  new OpenWeatherMapCollector(cityRepository),
  new AQICNCollector(cityRepository),
  new OpenMeteoCollector(cityRepository),
  new CETESBCollector(cityRepository),
  new IEMACollector(cityRepository),
  new IATCollector(cityRepository),
]
const fireCollectors = [new INPEFiresCollector()]
const prodesCollector = new PRODESCollector(deforestationRepository)
const datasusCollector = new DATASUSCollector(cityRepository, healthRepository)
const ibgeCollector = new IBGECollector()

const normalizer = new Normalizer(
  aqiCollectors,
  fireCollectors,
  aqiRepository,
  fireRepository,
  cacheService,
  prodesCollector,
  datasusCollector,
  ibgeCollector,
)

// Controllers
const cityController = new CityController(cityService, aqiService, windSmokeService, outdoorSafetyService, healthService)
const fireController = new FireController(fireService)
const adminController = new AdminController(jobLogRepository, normalizer)
const deforestationController = new DeforestationController(deforestationService)

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
app.use('/api/v1', buildRoutes({ cityController, fireController, adminController, deforestationController }))

app.use(errorHandler)

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
