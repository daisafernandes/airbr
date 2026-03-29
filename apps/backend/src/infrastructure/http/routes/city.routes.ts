import { Router } from 'express'

import type { CityController } from '@infrastructure/http/controllers/CityController'
import { asyncHandler } from '@shared/utils/asyncHandler'

export const buildCityRoutes = (controller: CityController): Router => {
  const router = Router()

  // Static routes must come before /:id to avoid conflicts
  router.get('/search', asyncHandler(controller.searchCities))
  router.get('/nearby', asyncHandler(controller.findNearby))
  router.get('/ranking', asyncHandler(controller.getRanking))
  router.get('/oms-compliance', asyncHandler(controller.getOMSCompliance))
  router.get('/', asyncHandler(controller.listCities))
  router.get('/:id', asyncHandler(controller.getCity))
  router.get('/:id/history', asyncHandler(controller.getCityHistory))
  router.get('/:id/wind-smoke', asyncHandler(controller.getWindSmoke))
  router.get('/:id/outdoor-safety', asyncHandler(controller.getOutdoorSafety))
  router.get('/:id/health', asyncHandler(controller.getHealthData))

  return router
}
