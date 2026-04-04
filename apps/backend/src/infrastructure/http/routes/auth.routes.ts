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

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.preprocess(
    (v) => (v === '' ? null : v),
    z.union([z.string(), z.null()]).optional(),
  ),
  defaultCityId: z.union([z.string().cuid(), z.null()]).optional(),
  preferredLocale: z.enum(['pt', 'en', 'es']).optional(),
})

export const buildAuthRoutes = (controller: AuthController): Router => {
  const router = Router()

  router.post('/register', validateBody(registerSchema), asyncHandler(controller.register))
  router.post('/login', validateBody(loginSchema), asyncHandler(controller.login))
  router.get('/me', requireAuth, asyncHandler(controller.me))
  router.patch('/me', requireAuth, validateBody(updateProfileSchema), asyncHandler(controller.updateMe))
  router.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(controller.forgotPassword))
  router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(controller.resetPassword))

  return router
}
