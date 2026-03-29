import { Router } from 'express'

import type { AdminController } from '@infrastructure/http/controllers/AdminController'

export const buildAdminRoutes = (adminController: AdminController): Router => {
  const router = Router()

  router.get('/jobs', adminController.listJobs)

  return router
}
