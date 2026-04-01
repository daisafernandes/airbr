import type { AlertChannel as PrismaAlertChannel } from '@prisma/client'

import { Alert } from '@domain/entities/Alert'
import type {
  ActiveAlertForJob,
  IAlertRepository,
} from '@domain/repositories/IAlertRepository'
import { prisma } from '@infrastructure/database/prisma'

const channelToDomain = (c: PrismaAlertChannel): 'EMAIL' | 'PUSH' =>
  c === 'EMAIL' ? 'EMAIL' : 'PUSH'

const channelsToDomain = (channels: PrismaAlertChannel[]): Array<'EMAIL' | 'PUSH'> =>
  channels.map(channelToDomain)

const toDomain = (row: {
  id: string
  userId: string
  cityId: string
  thresholdAqi: number
  channels: PrismaAlertChannel[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}): Alert =>
  Alert.create({
    id: row.id,
    userId: row.userId,
    cityId: row.cityId,
    thresholdAqi: row.thresholdAqi,
    channels: channelsToDomain(row.channels),
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

export class PrismaAlertRepository implements IAlertRepository {
  async findByUserId(userId: string): Promise<Alert[]> {
    const rows = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toDomain)
  }

  async findByUserIdPaginated(params: {
    userId: string
    page: number
    limit: number
  }): Promise<{ data: Alert[]; total: number }> {
    const skip = (params.page - 1) * params.limit
    const [rows, total] = await Promise.all([
      prisma.alert.findMany({
        where: { userId: params.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      prisma.alert.count({ where: { userId: params.userId } }),
    ])

    return { data: rows.map(toDomain), total }
  }

  async findByIdForUser(alertId: string, userId: string): Promise<Alert | null> {
    const row = await prisma.alert.findFirst({
      where: { id: alertId, userId },
    })
    return row ? toDomain(row) : null
  }

  async create(data: {
    userId: string
    cityId: string
    thresholdAqi: number
    channels: Array<'EMAIL' | 'PUSH'>
    active?: boolean
  }): Promise<Alert> {
    const row = await prisma.alert.create({
      data: {
        userId: data.userId,
        cityId: data.cityId,
        thresholdAqi: data.thresholdAqi,
        channels: data.channels,
        active: data.active ?? true,
      },
    })
    return toDomain(row)
  }

  async delete(alertId: string, userId: string): Promise<boolean> {
    const result = await prisma.alert.deleteMany({
      where: { id: alertId, userId },
    })
    return result.count > 0
  }

  async updateActive(alertId: string, userId: string, active: boolean): Promise<Alert | null> {
    const updated = await prisma.alert.updateMany({
      where: { id: alertId, userId },
      data: { active },
    })
    if (updated.count === 0) {
      return null
    }
    return this.findByIdForUser(alertId, userId)
  }

  async findRecentDispatchesForAlert(
    alertId: string,
    limit: number,
  ): Promise<
    Array<{
      channel: 'EMAIL' | 'PUSH'
      aqiValue: number
      sentAt: Date
    }>
  > {
    const rows = await prisma.alertDispatch.findMany({
      where: { alertId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      select: { channel: true, aqiValue: true, sentAt: true },
    })
    return rows.map((r) => ({
      channel: channelToDomain(r.channel),
      aqiValue: r.aqiValue,
      sentAt: r.sentAt,
    }))
  }

  async findActiveForChecker(): Promise<ActiveAlertForJob[]> {
    const rows = await prisma.alert.findMany({
      where: { active: true },
      include: {
        user: { select: { email: true, name: true } },
        city: { select: { name: true, state: true } },
      },
    })

    return rows.map((row) => ({
      alertId: row.id,
      userId: row.userId,
      userEmail: row.user.email,
      userName: row.user.name,
      cityId: row.cityId,
      cityName: row.city.name,
      state: row.city.state,
      thresholdAqi: row.thresholdAqi,
      channels: channelsToDomain(row.channels),
    }))
  }

  async recordDispatch(alertId: string, channel: 'EMAIL' | 'PUSH', aqiValue: number): Promise<void> {
    await prisma.alertDispatch.create({
      data: {
        alertId,
        channel,
        aqiValue,
      },
    })
  }

  async lastDispatchAt(alertId: string): Promise<Date | null> {
    const last = await prisma.alertDispatch.findFirst({
      where: { alertId },
      orderBy: { sentAt: 'desc' },
      select: { sentAt: true },
    })
    return last?.sentAt ?? null
  }
}
