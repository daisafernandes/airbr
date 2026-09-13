import compression from 'compression'
import cors from 'cors'
import express, { json, type Express } from 'express'
import helmet from 'helmet'

import { AirQualityForecastService } from '@application/services/AirQualityForecastService'
import { AqiService } from '@application/services/AqiService'
import { CityService } from '@application/services/CityService'
import { DeforestationService } from '@application/services/DeforestationService'
import { FireService } from '@application/services/FireService'
import { HealthService } from '@application/services/HealthService'
import { OutdoorSafetyService } from '@application/services/OutdoorSafetyService'
import { WindSmokeService } from '@application/services/WindSmokeService'
import { NodeCacheService } from '@infrastructure/cache/NodeCacheService'
import { env } from '@infrastructure/config/env'
import { EmptyHealthRepository } from '@infrastructure/database/repositories/EmptyHealthRepository'
import { JsonCityRepository } from '@infrastructure/database/repositories/JsonCityRepository'
import { JsonMunicipalityRepository } from '@infrastructure/database/repositories/JsonMunicipalityRepository'
import { LiveAqiRepository } from '@infrastructure/database/repositories/LiveAqiRepository'
import { LiveDeforestationRepository } from '@infrastructure/database/repositories/LiveDeforestationRepository'
import { LiveFireRepository } from '@infrastructure/database/repositories/LiveFireRepository'
import { CityController } from '@infrastructure/http/controllers/CityController'
import { DeforestationController } from '@infrastructure/http/controllers/DeforestationController'
import { FireController } from '@infrastructure/http/controllers/FireController'
import { errorHandler } from '@infrastructure/http/middlewares/errorHandler'
import { apiRateLimiter } from '@infrastructure/http/middlewares/rateLimit'
import { buildRoutes } from '@infrastructure/http/routes'

export interface CreateAppResult {
  app: Express
  cacheService: NodeCacheService
}

/**
 * Builds the HTTP application (no listen). Used by main and tests.
 */
export function createApp(): CreateAppResult {
  const app = express()

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  app.use(helmet({ contentSecurityPolicy: false }))
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()), credentials: true }))
  app.use(compression())
  app.use(json({ limit: '256kb' }))
  app.use('/api/v1', apiRateLimiter)

  const cacheService = new NodeCacheService()

  const cityRepository = new JsonCityRepository()
  const aqiRepository = new LiveAqiRepository(cityRepository, cacheService)
  const fireRepository = new LiveFireRepository(cacheService)
  const municipalityRepository = new JsonMunicipalityRepository()
  const deforestationRepository = new LiveDeforestationRepository(cacheService)
  const healthRepository = new EmptyHealthRepository()

  const cityService = new CityService(cityRepository, aqiRepository, cacheService)
  const aqiService = new AqiService(aqiRepository, cacheService)
  const fireService = new FireService(fireRepository, cacheService, municipalityRepository)
  const windSmokeService = new WindSmokeService(aqiRepository, fireRepository, cacheService)
  const outdoorSafetyService = new OutdoorSafetyService(aqiRepository, cacheService)
  const healthService = new HealthService(healthRepository, aqiRepository, cityRepository, cacheService)
  const airQualityForecastService = new AirQualityForecastService(cacheService)
  const deforestationService = new DeforestationService(deforestationRepository, cacheService)

  const cityController = new CityController(
    cityService,
    aqiService,
    windSmokeService,
    outdoorSafetyService,
    healthService,
    airQualityForecastService,
  )
  const fireController = new FireController(fireService)
  const deforestationController = new DeforestationController(deforestationService)

  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/api/v1/metrics/summary', (_req, res) => {
    res.json({
      uptimeSeconds: Math.round(process.uptime()),
    })
  })

  app.use(
    '/api/v1',
    buildRoutes({
      cityController,
      fireController,
      deforestationController,
    }),
  )

  app.use(errorHandler)

  return { app, cacheService }
}
