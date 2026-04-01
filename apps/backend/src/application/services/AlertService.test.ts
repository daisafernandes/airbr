import { AlertService } from './AlertService'
import { Alert } from '@domain/entities/Alert'
import type { IAlertRepository } from '@domain/repositories/IAlertRepository'
import type { CityData, ICityRepository } from '@domain/repositories/ICityRepository'
import { AppError } from '@shared/errors/AppError'

const now = new Date('2026-01-01T00:00:00.000Z')

const city: CityData = {
  id: 'city-1',
  name: 'Sao Paulo',
  state: 'SP',
  region: 'SE',
  lat: -23.5,
  lng: -46.6,
  source: 'seed',
  populationTotal: null,
  elderlyPct: null,
  childrenPct: null,
  createdAt: now,
}

const buildAlert = (overrides?: Partial<ReturnType<Alert['toJSON']>>): Alert =>
  Alert.create({
    id: overrides?.id ?? 'alert-1',
    userId: overrides?.userId ?? 'user-1',
    cityId: overrides?.cityId ?? 'city-1',
    thresholdAqi: overrides?.thresholdAqi ?? 100,
    channels: overrides?.channels ?? ['EMAIL'],
    active: overrides?.active ?? true,
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
  })

class AlertRepoMock implements IAlertRepository {
  public items: Alert[] = [buildAlert()]

  async findByUserId(): Promise<Alert[]> {
    return this.items
  }
  async findByIdForUser(): Promise<Alert | null> {
    return this.items[0] ?? null
  }
  async create(data: {
    userId: string
    cityId: string
    thresholdAqi: number
    channels: Array<'EMAIL' | 'PUSH'>
    active?: boolean
  }): Promise<Alert> {
    return buildAlert(data)
  }
  async delete(): Promise<boolean> {
    return true
  }
  async updateActive(): Promise<Alert | null> {
    return this.items[0] ?? null
  }
  async findRecentDispatchesForAlert() {
    return [{ channel: 'EMAIL' as const, aqiValue: 125, sentAt: now }]
  }
  async findActiveForChecker() {
    return []
  }
  async recordDispatch(): Promise<void> {}
  async lastDispatchAt(): Promise<Date | null> {
    return null
  }
}

class CityRepoMock implements ICityRepository {
  async findAll(): Promise<CityData[]> {
    return [city]
  }
  async findById(id: string): Promise<CityData | null> {
    return id === city.id ? city : null
  }
  async findByName(): Promise<CityData[]> {
    return [city]
  }
  async findNearby() {
    return []
  }
}

describe('AlertService', () => {
  it('creates alert when payload is valid', async () => {
    const alerts = new AlertRepoMock()
    const cities = new CityRepoMock()
    const sut = new AlertService(alerts, cities)

    const created = await sut.create('user-1', {
      cityId: city.id,
      thresholdAqi: 150,
      channels: ['EMAIL', 'PUSH'],
    })

    expect(created.thresholdAqi).toBe(150)
    expect(created.channels).toEqual(['EMAIL', 'PUSH'])
  })

  it('fails when threshold is out of range', async () => {
    const sut = new AlertService(new AlertRepoMock(), new CityRepoMock())

    await expect(
      sut.create('user-1', {
        cityId: city.id,
        thresholdAqi: 999,
        channels: ['EMAIL'],
      }),
    ).rejects.toBeInstanceOf(AppError)
  })

  it('fails when city does not exist', async () => {
    const sut = new AlertService(new AlertRepoMock(), new CityRepoMock())

    await expect(
      sut.create('user-1', {
        cityId: 'unknown-city',
        thresholdAqi: 120,
        channels: ['EMAIL'],
      }),
    ).rejects.toBeInstanceOf(AppError)
  })

  it('returns listWithCity with recent dispatches mapped', async () => {
    const sut = new AlertService(new AlertRepoMock(), new CityRepoMock())

    const list = await sut.listWithCity('user-1')

    expect(list).toHaveLength(1)
    expect(list[0]?.cityName).toBe('Sao Paulo')
    expect(list[0]?.recentDispatches[0]?.sentAt).toBe(now.toISOString())
  })
})
