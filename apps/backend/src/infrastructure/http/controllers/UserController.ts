import { Request, Response } from 'express'

import { CreateUserService } from '@application/services/CreateUserService'
import { CreateUserSchema } from '@application/dtos/user.dto'

export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  async create(req: Request, res: Response): Promise<void> {
    const dto = CreateUserSchema.parse(req.body)
    const user = await this.createUserService.execute(dto)
    res.status(201).json(user)
  }
}
