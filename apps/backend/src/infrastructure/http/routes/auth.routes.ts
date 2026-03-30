import { Router } from 'express'
import { z } from 'zod'

import type { AuthController } from '@infrastructure/http/controllers/AuthController'
import { requireAuth } from '@infrastructure/http/middlewares/requireAuth'
import { validateBody } from '@infrastructure/http/middlewares/validateRequest'
import { asyncHandler } from '@shared/utils/asyncHandler'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const buildAuthRoutes = (controller: AuthController): Router => {
  const router = Router()

  router.post('/register', validateBody(registerSchema), asyncHandler(controller.register))
  router.post('/login', validateBody(loginSchema), asyncHandler(controller.login))
  router.get('/me', requireAuth, asyncHandler(controller.me))

  return router
}
