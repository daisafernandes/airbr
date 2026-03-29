import { Router } from 'express'

import { UserController } from '@infrastructure/http/controllers/UserController'
import { validateBody } from '@infrastructure/http/middlewares/validateRequest'
import { CreateUserSchema } from '@application/dtos/user.dto'

export const buildUserRoutes = (userController: UserController): Router => {
  const router = Router()

  router.post('/', validateBody(CreateUserSchema), (req, res) => userController.create(req, res))

  return router
}
