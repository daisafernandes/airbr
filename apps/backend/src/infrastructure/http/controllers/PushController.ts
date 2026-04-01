import type { Request, Response } from 'express'

import type { IPushSubscriptionRepository } from '@domain/repositories/IPushSubscriptionRepository'
import { env } from '@infrastructure/config/env'
import { AppError } from '@shared/errors/AppError'

export class PushController {
  constructor(private readonly pushSubscriptions: IPushSubscriptionRepository) {}

  vapidPublicKey = async (_req: Request, res: Response): Promise<void> => {
    res.json({
      publicKey: env.VAPID_PUBLIC_KEY ?? null,
    })
  }

  subscribe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId
    if (!userId) throw new AppError('Unauthorized', 401)

    const body = req.body as {
      endpoint: string
      keys: { p256dh: string; auth: string }
    }

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      throw new AppError('endpoint and keys.p256dh, keys.auth are required', 400)
    }

    await this.pushSubscriptions.upsert(userId, {
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    })

    res.status(201).json({ status: 'ok' })
  }
}
