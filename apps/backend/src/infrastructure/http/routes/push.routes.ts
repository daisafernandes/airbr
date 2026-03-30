import { Router } from 'express'
import { z } from 'zod'

import type { PushController } from '@infrastructure/http/controllers/PushController'
import { requireAuth } from '@infrastructure/http/middlewares/requireAuth'
import { validateBody } from '@infrastructure/http/middlewares/validateRequest'
import { asyncHandler } from '@shared/utils/asyncHandler'

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export const buildPushRoutes = (controller: PushController): Router => {
  const router = Router()

  router.get('/vapid-public-key', asyncHandler(controller.vapidPublicKey))
  router.post('/subscribe', requireAuth, validateBody(subscribeSchema), asyncHandler(controller.subscribe))

  return router
}
