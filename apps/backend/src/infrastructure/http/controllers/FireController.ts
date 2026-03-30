import type { Request, Response } from 'express'

import type { FireService } from '@application/services/FireService'

export class FireController {
  constructor(private readonly fireService: FireService) {}

  listFires = async (req: Request, res: Response): Promise<void> => {
    const { state, biome, days } = req.query

    let daysNum: number | undefined
    if (typeof days === 'string') {
      const n = Number.parseInt(days, 10)
      if (!Number.isNaN(n) && n > 0) daysNum = n
    }

    const fires = await this.fireService.listFires({
      state: typeof state === 'string' ? state : undefined,
      biome: typeof biome === 'string' ? biome : undefined,
      days: daysNum,
    })

    res.json(fires)
  }
}
