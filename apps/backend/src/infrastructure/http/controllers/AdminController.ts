import type { IJobLogRepository, JobStatus } from '@domain/repositories/IJobLogRepository'
import type { Normalizer } from '@jobs/Normalizer'
import type { Request, Response } from 'express'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export class AdminController {
  constructor(
    private readonly jobLogRepository: IJobLogRepository,
    private readonly normalizer: Normalizer,
  ) {}

  triggerAllCollections = async (_req: Request, res: Response): Promise<void> => {
    void this.normalizer.runAllCollections().catch((err) => {
      console.error('[Admin] runAllCollections failed:', err)
    })
    res.status(202).json({ status: 'started' })
  }

  listJobs = async (req: Request, res: Response): Promise<void> => {
    const raw = parseInt(String(req.query['limit'] ?? DEFAULT_LIMIT), 10)
    const limit = isNaN(raw) || raw < 1 ? DEFAULT_LIMIT : Math.min(raw, MAX_LIMIT)

    const status = req.query['status'] as JobStatus | undefined;
    const jobs = await this.jobLogRepository.findRecent(limit, status)
    res.json({ jobs })
  }
}
