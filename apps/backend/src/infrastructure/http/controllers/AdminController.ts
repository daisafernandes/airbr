import type { Request, Response } from 'express'

import type { IJobLogRepository } from '@domain/repositories/IJobLogRepository'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export class AdminController {
  constructor(private readonly jobLogRepository: IJobLogRepository) {}

  listJobs = async (req: Request, res: Response): Promise<void> => {
    const raw = parseInt(String(req.query['limit'] ?? DEFAULT_LIMIT), 10)
    const limit = isNaN(raw) || raw < 1 ? DEFAULT_LIMIT : Math.min(raw, MAX_LIMIT)

    const jobs = await this.jobLogRepository.findRecent(limit)
    res.json({ jobs })
  }
}
