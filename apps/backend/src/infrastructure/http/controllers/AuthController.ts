import type { Request, Response } from 'express'

import type { AuthService } from '@application/services/AuthService'
import { AppError } from '@shared/errors/AppError'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body as { email: string; password: string; name: string }
    const result = await this.authService.register({ email, password, name })
    res.status(201).json(result)
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string }
    const result = await this.authService.login({ email, password })
    res.json(result)
  }

  me = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId
    if (!userId) {
      throw new AppError('Unauthorized', 401)
    }
    const user = await this.authService.getProfile(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    res.json(user)
  }
}
