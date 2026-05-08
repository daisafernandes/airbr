import type { Request, Response } from 'express'

import type { FireService } from '@application/services/FireService'
import { sanitizePagination } from '@shared/utils/pagination'

/** Caps `days` on GET /fires to limit DB scan size and cache cardinality (matches longest preset + margin). */
const MAX_FIRE_HISTORY_DAYS = 366

export class FireController {
  constructor(private readonly fireService: FireService) {}

  listFires = async (req: Request, res: Response): Promise<void> => {
    const { state, biome, days } = req.query

    let daysNum: number | undefined
    if (typeof days === 'string') {
      const n = Number.parseInt(days, 10)
      if (!Number.isNaN(n) && n > 0) daysNum = Math.min(n, MAX_FIRE_HISTORY_DAYS)
    }

    const paginated = await this.fireService.listFiresPaginated({
      state: typeof state === 'string' ? state : undefined,
      biome: typeof biome === 'string' ? biome : undefined,
      days: daysNum,
      ...sanitizePagination({
        page: Number(req.query['page']),
        limit: Number(req.query['limit']),
      }),
    })
    res.json(paginated)
  }

  getFireById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    if (typeof id !== 'string' || id.length === 0) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const fire = await this.fireService.getFireById(id)
    if (!fire) {
      res.status(404).json({ message: 'Fire focus not found' })
      return
    }
    res.json(fire)
  }
}
