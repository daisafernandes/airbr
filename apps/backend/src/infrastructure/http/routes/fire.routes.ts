import { Router } from 'express'

import type { FireController } from '@infrastructure/http/controllers/FireController'

export const buildFireRoutes = (controller: FireController): Router => {
  const router = Router()

  router.get('/', controller.listFires)

  return router
}
