import { Router } from 'express'

import type { CityController } from '@infrastructure/http/controllers/CityController'

export const buildCityRoutes = (controller: CityController): Router => {
  const router = Router()

  // Static routes must come before /:id to avoid conflicts
  router.get('/search', controller.searchCities)
  router.get('/nearby', controller.findNearby)
  router.get('/ranking', controller.getRanking)
  router.get('/', controller.listCities)
  router.get('/:id', controller.getCity)
  router.get('/:id/history', controller.getCityHistory)

  return router
}
