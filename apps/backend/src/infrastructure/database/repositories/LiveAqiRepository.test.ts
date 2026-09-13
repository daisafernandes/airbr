import type { ICacheService } from '@domain/cache/ICacheService'
import type { CityData, ICityRepository, NearbyCity } from '@domain/repositories/ICityRepository'
import { LiveAqiRepository } from './LiveAqiRepository'
import * as openMeteo from '@infrastructure/providers/openMeteoClient'

jest.mock('@infrastructure/providers/openMeteoClient', () => ({
  fetchOpenMeteoCurrent: jest.fn(),
  fetchOpenMeteoHistory: jest.fn(),
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

function city(partial: Partial<CityData> & Pick<CityData, 'id' | 'name' | 'state'>): CityData {
  return {
    region: 'Sudeste',
    lat: -23.55,
    lng: -46.63,
    source: 'json',
    populationTotal: null,
    elderlyPct: null,
    childrenPct: null,
    createdAt: new Date(0),
    ...partial,
  }
}

class StubCityRepository implements ICityRepository {
  constructor(private readonly cities: CityData[]) {}

  async findAll(): Promise<CityData[]> {
    return [...this.cities]
  }

  async findAllPaginated(): Promise<{ data: CityData[]; total: number }> {
    return { data: [...this.cities], total: this.cities.length }
  }

  async findById(id: string): Promise<CityData | null> {
    return this.cities.find((c) => c.id === id) ?? null
  }

  async findByName(): Promise<CityData[]> {
    return []
  }

  async findNearby(): Promise<NearbyCity[]> {
    return []
  }
}

describe('LiveAqiRepository', () => {
  const cities = [
    city({ id: 'sao-paulo-sp', name: 'São Paulo', state: 'SP', lat: -23.55, lng: -46.63 }),
    city({
      id: 'curitiba-pr',
      name: 'Curitiba',
      state: 'PR',
      region: 'Sul',
      lat: -25.43,
      lng: -49.27,
    }),
  ]

  const fetchCurrent = openMeteo.fetchOpenMeteoCurrent as jest.MockedFunction<
    typeof openMeteo.fetchOpenMeteoCurrent
  >
  const fetchHistory = openMeteo.fetchOpenMeteoHistory as jest.MockedFunction<
    typeof openMeteo.fetchOpenMeteoHistory
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('findLatestByCity fetches Open-Meteo and caches', async () => {
    const cache = new MemoryCache()
    const repo = new LiveAqiRepository(new StubCityRepository(cities), cache)
    const reading = {
      id: 'sao-paulo-sp:t',
      cityId: 'sao-paulo-sp',
      aqi: 42,
      pm25: 8,
      pm10: null,
      o3: null,
      no2: null,
      co: null,
      uv: 3,
      pollen: null,
      windDirection: 180,
      windSpeed: 5,
      temperature: 22,
      humidity: 60,
      pressure: 1013,
      timestamp: new Date(),
      source: 'open-meteo',
    }
    fetchCurrent.mockResolvedValueOnce(reading)

    const first = await repo.findLatestByCity('sao-paulo-sp')
    const second = await repo.findLatestByCity('sao-paulo-sp')

    expect(first?.aqi).toBe(42)
    expect(second?.aqi).toBe(42)
    expect(fetchCurrent).toHaveBeenCalledTimes(1)
  })

  it('getRanking and getOMSCompliance use bulk latest cache', async () => {
    const cache = new MemoryCache()
    const repo = new LiveAqiRepository(new StubCityRepository(cities), cache)

    fetchCurrent
      .mockResolvedValueOnce({
        id: 'a',
        cityId: 'sao-paulo-sp',
        aqi: 90,
        pm25: 12,
        pm10: null,
        o3: null,
        no2: null,
        co: null,
        uv: null,
        pollen: null,
        windDirection: null,
        windSpeed: null,
        temperature: null,
        humidity: null,
        pressure: null,
        timestamp: new Date(),
        source: 'open-meteo',
      })
      .mockResolvedValueOnce({
        id: 'b',
        cityId: 'curitiba-pr',
        aqi: 20,
        pm25: 3,
        pm10: null,
        o3: null,
        no2: null,
        co: null,
        uv: null,
        pollen: null,
        windDirection: null,
        windSpeed: null,
        temperature: null,
        humidity: null,
        pressure: null,
        timestamp: new Date(),
        source: 'open-meteo',
      })

    const ranking = await repo.getRanking({ limit: 10 })
    expect(ranking.mostPolluted[0]?.cityId).toBe('sao-paulo-sp')
    expect(ranking.leastPolluted[0]?.cityId).toBe('curitiba-pr')

    const oms = await repo.getOMSCompliance()
    expect(oms.cities).toHaveLength(2)
    expect(oms.compliantPct).toBe(50)
    expect(fetchCurrent).toHaveBeenCalledTimes(2)

    // second call hits cache
    await repo.getRanking()
    expect(fetchCurrent).toHaveBeenCalledTimes(2)
  })

  it('findHistoryByCity fetches and caches by period', async () => {
    const cache = new MemoryCache()
    const repo = new LiveAqiRepository(new StubCityRepository(cities), cache)
    const history = [
      {
        id: 'h1',
        cityId: 'sao-paulo-sp',
        aqi: 40,
        pm25: 7,
        pm10: null,
        o3: null,
        no2: null,
        co: null,
        uv: null,
        pollen: null,
        windDirection: null,
        windSpeed: null,
        temperature: null,
        humidity: null,
        pressure: null,
        timestamp: new Date(),
        source: 'open-meteo',
      },
    ]
    fetchHistory.mockResolvedValueOnce(history)

    expect(await repo.findHistoryByCity('sao-paulo-sp', '24h')).toEqual(history)
    expect(await repo.findHistoryByCity('sao-paulo-sp', '24h')).toEqual(history)
    expect(fetchHistory).toHaveBeenCalledTimes(1)
  })
})
