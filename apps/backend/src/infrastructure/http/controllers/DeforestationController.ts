import type { Request, Response } from 'express'

import type { DeforestationService } from '@application/services/DeforestationService'

export class DeforestationController {
  constructor(private readonly deforestationService: DeforestationService) {}

  listAlerts = async (req: Request, res: Response): Promise<void> => {
    const { state, biome, since } = req.query

    const result = await this.deforestationService.listAlerts({
      state: typeof state === 'string' ? state : undefined,
      biome: typeof biome === 'string' ? biome : undefined,
      since: typeof since === 'string' ? new Date(since) : undefined,
    })

    res.json(result)
  }
}
