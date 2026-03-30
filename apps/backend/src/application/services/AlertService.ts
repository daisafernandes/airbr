import type { Alert } from '@domain/entities/Alert'
import type { IAlertRepository } from '@domain/repositories/IAlertRepository'
import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { AppError } from '@shared/errors/AppError'

export class AlertService {
  constructor(
    private readonly alerts: IAlertRepository,
    private readonly cities: ICityRepository,
  ) {}

  async list(userId: string): Promise<Alert[]> {
    return this.alerts.findByUserId(userId)
  }

  async listWithCity(userId: string): Promise<
    Array<
      ReturnType<Alert['toJSON']> & {
        cityName: string | null
        state: string | null
      }
    >
  > {
    const items = await this.alerts.findByUserId(userId)
    const out: Array<
      ReturnType<Alert['toJSON']> & { cityName: string | null; state: string | null }
    > = []

    for (const a of items) {
      const city = await this.cities.findById(a.cityId)
      out.push({
        ...a.toJSON(),
        cityName: city?.name ?? null,
        state: city?.state ?? null,
      })
    }
    return out
  }

  async create(
    userId: string,
    input: { cityId: string; thresholdAqi: number; channels: Array<'EMAIL' | 'PUSH'>; active?: boolean },
  ): Promise<Alert> {
    if (input.thresholdAqi < 0 || input.thresholdAqi > 500) {
      throw new AppError('thresholdAqi must be between 0 and 500', 400)
    }
    if (!input.channels.length) {
      throw new AppError('At least one channel (email or push) is required', 400)
    }

    const city = await this.cities.findById(input.cityId)
    if (!city) {
      throw new AppError('City not found', 404)
    }

    return this.alerts.create({
      userId,
      cityId: input.cityId,
      thresholdAqi: input.thresholdAqi,
      channels: input.channels,
      active: input.active,
    })
  }

  async remove(alertId: string, userId: string): Promise<boolean> {
    return this.alerts.delete(alertId, userId)
  }
}
