import type {
  IPushSubscriptionRepository,
  PushSubscriptionRecord,
} from '@domain/repositories/IPushSubscriptionRepository'
import { prisma } from '@infrastructure/database/prisma'

export class PrismaPushSubscriptionRepository implements IPushSubscriptionRepository {
  async upsert(userId: string, data: { endpoint: string; p256dh: string; auth: string }): Promise<void> {
    await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
      },
      update: {
        userId,
        p256dh: data.p256dh,
        auth: data.auth,
      },
    })
  }

  async findByUserId(userId: string): Promise<PushSubscriptionRecord[]> {
    const rows = await prisma.pushSubscription.findMany({
      where: { userId },
    })
    return rows.map((r) => ({
      id: r.id,
      endpoint: r.endpoint,
      p256dh: r.p256dh,
      auth: r.auth,
    }))
  }
}
