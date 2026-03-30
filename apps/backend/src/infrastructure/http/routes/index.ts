import { Router } from 'express'

import type { AdminController } from '@infrastructure/http/controllers/AdminController'
import type { AlertController } from '@infrastructure/http/controllers/AlertController'
import type { AuthController } from '@infrastructure/http/controllers/AuthController'
import type { CityController } from '@infrastructure/http/controllers/CityController'
import type { DeforestationController } from '@infrastructure/http/controllers/DeforestationController'
import type { FireController } from '@infrastructure/http/controllers/FireController'
import type { PushController } from '@infrastructure/http/controllers/PushController'
import { adminRateLimiter } from '@infrastructure/http/middlewares/rateLimit'

import { buildAdminRoutes } from './admin.routes'
import { buildAlertRoutes } from './alerts.routes'
import { buildAuthRoutes } from './auth.routes'
import { buildCityRoutes } from './city.routes'
import { buildDeforestationRoutes } from './deforestation.routes'
import { buildFireRoutes } from './fire.routes'
import { buildPushRoutes } from './push.routes'

interface Controllers {
  cityController: CityController
  fireController: FireController
  adminController: AdminController
  deforestationController: DeforestationController
  authController: AuthController
  alertController: AlertController
  pushController: PushController
}

export const buildRoutes = (controllers: Controllers): Router => {
  const router = Router()

  router.use('/auth', buildAuthRoutes(controllers.authController))
  router.use('/alerts', buildAlertRoutes(controllers.alertController))
  router.use('/push', buildPushRoutes(controllers.pushController))
  router.use('/cities', buildCityRoutes(controllers.cityController))
  router.use('/fires', buildFireRoutes(controllers.fireController))
  router.use('/deforestation', buildDeforestationRoutes(controllers.deforestationController))
  router.use('/admin', adminRateLimiter, buildAdminRoutes(controllers.adminController))

  return router
}
