import type { Request, Response } from 'express'

import type { AlertService } from '@application/services/AlertService'
import { AppError } from '@shared/errors/AppError'
import { sanitizePagination } from '@shared/utils/pagination'

const CHANNELS = new Set(['EMAIL', 'PUSH'])

export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const alerts = await this.alertService.listWithCityPaginated(
      userId,
      sanitizePagination({
        page: Number(req.query['page']),
        limit: Number(req.query['limit']),
      }),
    )
    res.json(alerts)
  }

  patch = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const id = req.params['id'] ?? ''
    const body = req.body as { active: boolean }
    const updated = await this.alertService.setActive(id, userId, body.active)
    if (!updated) {
      throw new AppError('Alert not found', 404)
    }
    res.json(updated.toJSON())
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId
    if (!userId) throw new AppError('Unauthorized', 401)

    const body = req.body as {
      cityId: string
      thresholdAqi: number
      channels: string[]
      active?: boolean
    }

    const channels = (body.channels ?? []).filter((c): c is 'EMAIL' | 'PUSH' =>
      CHANNELS.has(c),
    )

    const alert = await this.alertService.create(userId, {
      cityId: body.cityId,
      thresholdAqi: body.thresholdAqi,
      channels,
      active: body.active,
    })

    res.status(201).json(alert.toJSON())
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId
    if (!userId) throw new AppError('Unauthorized', 401)
    const id = req.params['id'] ?? ''
    const ok = await this.alertService.remove(id, userId)
    if (!ok) {
      throw new AppError('Alert not found', 404)
    }
    res.status(204).send()
  }
}
