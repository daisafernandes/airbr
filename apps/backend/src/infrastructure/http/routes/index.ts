import { Router } from 'express'

import type { AdminController } from '@infrastructure/http/controllers/AdminController'
import type { CityController } from '@infrastructure/http/controllers/CityController'
import type { FireController } from '@infrastructure/http/controllers/FireController'
import { buildAdminRoutes } from './admin.routes'
import { buildCityRoutes } from './city.routes'
import { buildFireRoutes } from './fire.routes'

interface Controllers {
  cityController: CityController
  fireController: FireController
  adminController: AdminController
}

export const buildRoutes = (controllers: Controllers): Router => {
  const router = Router()

  router.use('/cities', buildCityRoutes(controllers.cityController))
  router.use('/fires', buildFireRoutes(controllers.fireController))
  router.use('/admin', buildAdminRoutes(controllers.adminController))

  return router
}
