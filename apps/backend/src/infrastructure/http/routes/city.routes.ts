import { Router } from 'express'

import type { CityController } from '@infrastructure/http/controllers/CityController'
import { asyncHandler } from '@shared/utils/asyncHandler'

export const buildCityRoutes = (controller: CityController): Router => {
  const router = Router()

  // Static routes must come before /:id to avoid conflicts
  router.get('/search', asyncHandler(controller.searchCities))
  router.get('/nearby', asyncHandler(controller.findNearby))
  router.get('/ranking', asyncHandler(controller.getRanking))
  router.get('/', asyncHandler(controller.listCities))
  router.get('/:id', asyncHandler(controller.getCity))
  router.get('/:id/history', asyncHandler(controller.getCityHistory))

  return router
}
