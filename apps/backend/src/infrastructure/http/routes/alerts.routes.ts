import { Router } from 'express'
import { z } from 'zod'

import type { AlertController } from '@infrastructure/http/controllers/AlertController'
import { requireAuth } from '@infrastructure/http/middlewares/requireAuth'
import { validateBody } from '@infrastructure/http/middlewares/validateRequest'
import { asyncHandler } from '@shared/utils/asyncHandler'

const createAlertSchema = z.object({
  cityId: z.string().min(1),
  thresholdAqi: z.coerce.number().int().min(0).max(500),
  channels: z.array(z.enum(['EMAIL', 'PUSH'])).min(1),
  active: z.boolean().optional(),
})

export const buildAlertRoutes = (controller: AlertController): Router => {
  const router = Router()

  router.use(requireAuth)

  router.get('/', asyncHandler(controller.list))
  router.post('/', validateBody(createAlertSchema), asyncHandler(controller.create))
  router.delete('/:id', asyncHandler(controller.remove))

  return router
}
