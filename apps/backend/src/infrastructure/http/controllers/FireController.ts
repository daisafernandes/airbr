import type { Request, Response } from 'express'

import type { FireService } from '@application/services/FireService'

export class FireController {
  constructor(private readonly fireService: FireService) {}

  listFires = async (req: Request, res: Response): Promise<void> => {
    const { state, biome } = req.query

    const fires = await this.fireService.listFires({
      state: typeof state === 'string' ? state : undefined,
      biome: typeof biome === 'string' ? biome : undefined,
    })

    res.json(fires)
  }
}
