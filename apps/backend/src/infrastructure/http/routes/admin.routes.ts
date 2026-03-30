import { Router } from 'express'
import { asyncHandler } from '@shared/utils/asyncHandler'
import type { AdminController } from '@infrastructure/http/controllers/AdminController'
import { requireAdminAuth } from '@infrastructure/http/middlewares/requireAdminAuth'

export const buildAdminRoutes = (adminController: AdminController): Router => {
  const router = Router()

  router.use(requireAdminAuth)

  router.get('/jobs', asyncHandler(adminController.listJobs))
  router.post('/jobs/run', asyncHandler(adminController.triggerAllCollections))

  return router
}
