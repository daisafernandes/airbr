import { Router } from 'express'

import type { AdminController } from '@infrastructure/http/controllers/AdminController'
import { asyncHandler } from '@shared/utils/asyncHandler'

export const buildAdminRoutes = (adminController: AdminController): Router => {
  const router = Router()

  router.get('/jobs', asyncHandler(adminController.listJobs))

  return router
}
