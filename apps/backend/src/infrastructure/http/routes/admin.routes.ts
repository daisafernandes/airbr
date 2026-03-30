import { Router } from 'express'
import { asyncHandler } from '@shared/utils/asyncHandler'
import type { AdminController } from '@infrastructure/http/controllers/AdminController'

export const buildAdminRoutes = (adminController: AdminController): Router => {
  const router = Router()

  router.get('/jobs', asyncHandler(adminController.listJobs))
  router.post('/jobs/run', asyncHandler(adminController.triggerAllCollections))

  return router
}
