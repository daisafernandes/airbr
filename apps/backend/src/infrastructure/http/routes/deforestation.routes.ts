import { Router } from 'express'

import type { DeforestationController } from '@infrastructure/http/controllers/DeforestationController'
import { asyncHandler } from '@shared/utils/asyncHandler'

export const buildDeforestationRoutes = (controller: DeforestationController): Router => {
  const router = Router()

  router.get('/', asyncHandler(controller.listAlerts))

  return router
}
