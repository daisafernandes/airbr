import 'dotenv/config'

import express from 'express'

import { InMemoryUserRepository } from '@infrastructure/database/repositories/InMemoryUserRepository'
import { env } from '@infrastructure/config/env'
import { errorHandler } from '@infrastructure/http/middlewares/errorHandler'
import { buildRoutes } from '@infrastructure/http/routes'
import { UserController } from '@infrastructure/http/controllers/UserController'
import { BcryptHashProvider } from '@infrastructure/providers/BcryptHashProvider'
import { CreateUserService } from '@application/services/CreateUserService'

const app = express()
app.use(express.json())

const userRepository = new InMemoryUserRepository()
const hashProvider = new BcryptHashProvider()
const createUserService = new CreateUserService(userRepository, hashProvider)
const userController = new UserController(createUserService)

app.use('/api/v1', buildRoutes({ userController }))
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.warn(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
})
