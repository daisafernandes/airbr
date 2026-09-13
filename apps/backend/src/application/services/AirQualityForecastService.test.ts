import type { ICacheService } from '@domain/cache/ICacheService'
import * as openMeteo from '@infrastructure/providers/openMeteoClient'

import { AirQualityForecastService } from './AirQualityForecastService'

jest.mock('@infrastructure/providers/openMeteoClient', () => ({
  fetchOpenMeteoForecast: jest.fn(),
}))

class MemoryCache implements ICacheService {
  private store = new Map<string, unknown>()

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value)
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }
}

describe('AirQualityForecastService', () => {
  const fetchForecast = openMeteo.fetchOpenMeteoForecast as jest.MockedFunction<
    typeof openMeteo.fetchOpenMeteoForecast
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches Open-Meteo forecast and caches', async () => {
    fetchForecast.mockResolvedValueOnce([
      { time: '2024-01-01T00:00', aqi: 35 },
      { time: '2024-01-01T01:00', aqi: null },
    ])

    const service = new AirQualityForecastService(new MemoryCache())
    const first = await service.getForecast('sao-paulo-sp', -23.55, -46.63)
    const second = await service.getForecast('sao-paulo-sp', -23.55, -46.63)

    expect(first).toEqual({
      cityId: 'sao-paulo-sp',
      hours: [
        { time: '2024-01-01T00:00', aqi: 35 },
        { time: '2024-01-01T01:00', aqi: null },
      ],
      source: 'open-meteo',
    })
    expect(second).toEqual(first)
    expect(fetchForecast).toHaveBeenCalledTimes(1)
  })
})
