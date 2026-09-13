import { Router } from 'express'

import type { CityController } from '@infrastructure/http/controllers/CityController'
import type { DeforestationController } from '@infrastructure/http/controllers/DeforestationController'
import type { FireController } from '@infrastructure/http/controllers/FireController'

import { buildCityRoutes } from './city.routes'
import { buildDeforestationRoutes } from './deforestation.routes'
import { buildFireRoutes } from './fire.routes'

interface Controllers {
  cityController: CityController
  fireController: FireController
  deforestationController: DeforestationController
}

export const buildRoutes = (controllers: Controllers): Router => {
  const router = Router()

  router.use('/cities', buildCityRoutes(controllers.cityController))
  router.use('/fires', buildFireRoutes(controllers.fireController))
  router.use('/deforestation', buildDeforestationRoutes(controllers.deforestationController))

  return router
}
