import { Router } from 'express'

import type { CityController } from '@infrastructure/http/controllers/CityController'
import type { FireController } from '@infrastructure/http/controllers/FireController'
import { buildCityRoutes } from './city.routes'
import { buildFireRoutes } from './fire.routes'

interface Controllers {
  cityController: CityController
  fireController: FireController
}

export const buildRoutes = (controllers: Controllers): Router => {
  const router = Router()

  router.use('/cities', buildCityRoutes(controllers.cityController))
  router.use('/fires', buildFireRoutes(controllers.fireController))

  return router
}
