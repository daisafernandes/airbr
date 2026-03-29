import { Router } from 'express'

import { UserController } from '@infrastructure/http/controllers/UserController'

import { buildUserRoutes } from './user.routes'

export const buildRoutes = (controllers: { userController: UserController }): Router => {
  const router = Router()

  router.use('/users', buildUserRoutes(controllers.userController))

  return router
}
