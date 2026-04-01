import { CityService } from './CityService'
import type { ICacheService } from '@domain/cache/ICacheService'
import type { AqiReadingData, IAqiRepository, HistoryPeriod, OMSComplianceCity, RankedCity } from '@domain/repositories/IAqiRepository'
import type { CityData, ICityRepository, NearbyCity } from '@domain/repositories/ICityRepository'

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

const reading: AqiReadingData = {
  id: 'aqi-1',
  cityId: 'city-1',
  aqi: 90,
  pm25: 15,
  pm10: null,
  o3: null,
  no2: null,
  co: null,
  uv: null,
  pollen: null,
  windDirection: null,
  windSpeed: null,
  temperature: null,
  timestamp: now,
  source: 'open-meteo',
}

class InMemoryCache implements ICacheService {
  private readonly data = new Map<string, unknown>()
  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined
  }
  set<T>(key: string, value: T): void {
    this.data.set(key, value)
  }
  invalidate(key: string): void {
    this.data.delete(key)
  }
  invalidateByPrefix(prefix: string): void {
    for (const key of this.data.keys()) {
      if (key.startsWith(prefix)) this.data.delete(key)
    }
  }
}

class CityRepoMock implements ICityRepository {
  async findAll(): Promise<CityData[]> {
    return [city]
  }
  async findById(id: string): Promise<CityData | null> {
    return id === city.id ? city : null
  }
  async findByName(name: string): Promise<CityData[]> {
    return name.toLowerCase().includes('sao') ? [city] : []
  }
  async findNearby(): Promise<NearbyCity[]> {
    return [{ ...city, distanceKm: 4.2 }]
  }
}

class AqiRepoMock implements IAqiRepository {
  async findLatestByCity(cityId: string): Promise<AqiReadingData | null> {
    return cityId === city.id ? reading : null
  }
  async findLatestForAllCities(): Promise<AqiReadingData[]> {
    return [reading]
  }
  async findHistoryByCity(_cityId: string, _period: HistoryPeriod): Promise<AqiReadingData[]> {
    return [reading]
  }
  async upsert(): Promise<AqiReadingData> {
    return reading
  }
  async getRanking(): Promise<{ mostPolluted: RankedCity[]; leastPolluted: RankedCity[] }> {
    return { mostPolluted: [], leastPolluted: [] }
  }
  async getOMSCompliance(): Promise<{ cities: OMSComplianceCity[]; compliantPct: number }> {
    return { cities: [], compliantPct: 0 }
  }
}

describe('CityService', () => {
  it('lists cities with AQI and caches response', async () => {
    const cache = new InMemoryCache()
    const sut = new CityService(new CityRepoMock(), new AqiRepoMock(), cache)

    const first = await sut.listCities()
    const second = await sut.listCities()

    expect(first[0]?.latestAqi?.aqi).toBe(90)
    expect(second).toEqual(first)
  })

  it('returns null when city does not exist', async () => {
    const sut = new CityService(new CityRepoMock(), new AqiRepoMock(), new InMemoryCache())

    const result = await sut.getCityById('missing-city')

    expect(result).toBeNull()
  })

  it('searches cities and enriches each city with latest AQI', async () => {
    const sut = new CityService(new CityRepoMock(), new AqiRepoMock(), new InMemoryCache())

    const result = await sut.searchCities('Sao')

    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Sao Paulo')
    expect(result[0]?.latestAqi?.source).toBe('open-meteo')
  })

  it('returns nearby cities with distance and AQI', async () => {
    const sut = new CityService(new CityRepoMock(), new AqiRepoMock(), new InMemoryCache())

    const result = await sut.findNearby(-23.5, -46.6, 10)

    expect(result).toHaveLength(1)
    expect(result[0]?.distanceKm).toBe(4.2)
    expect(result[0]?.latestAqi?.aqi).toBe(90)
  })
})
