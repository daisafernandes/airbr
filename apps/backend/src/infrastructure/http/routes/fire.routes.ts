import { Router } from 'express'

import type { FireController } from '@infrastructure/http/controllers/FireController'
import { asyncHandler } from '@shared/utils/asyncHandler'

export const buildFireRoutes = (controller: FireController): Router => {
  const router = Router()

  router.get('/', asyncHandler(controller.listFires))
  router.get('/:id', asyncHandler(controller.getFireById))

  return router
}
