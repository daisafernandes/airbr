import type { ICacheService } from '@domain/cache/ICacheService'
import type { AqiReadingData, IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { CityData, ICityRepository, NearbyCity } from '@domain/repositories/ICityRepository'

const TTL_15_MIN = 60 * 15

export interface CityWithAqi extends CityData {
  latestAqi: AqiReadingData | null
}

export interface NearbyCityWithAqi extends NearbyCity {
  latestAqi: AqiReadingData | null
}

export class CityService {
  constructor(
    private readonly cityRepository: ICityRepository,
    private readonly aqiRepository: IAqiRepository,
    private readonly cache: ICacheService,
  ) {}

  async listCities(): Promise<CityWithAqi[]> {
    const key = 'cities:all'
    const cached = this.cache.get<CityWithAqi[]>(key)
    if (cached) return cached

    const [cities, readings] = await Promise.all([
      this.cityRepository.findAll(),
      this.aqiRepository.findLatestForAllCities(),
    ])

    const readingsByCity = new Map(readings.map((r) => [r.cityId, r]))

    const result = cities.map((city) => ({
      ...city,
      latestAqi: readingsByCity.get(city.id) ?? null,
    }))

    this.cache.set(key, result, TTL_15_MIN)
    return result
  }

  async getCityById(id: string): Promise<CityWithAqi | null> {
    const key = `city:${id}`
    const cached = this.cache.get<CityWithAqi>(key)
    if (cached) return cached

    const city = await this.cityRepository.findById(id)
    if (!city) return null

    const latestAqi = await this.aqiRepository.findLatestByCity(id)
    const result = { ...city, latestAqi }

    this.cache.set(key, result, TTL_15_MIN)
    return result
  }

  async searchCities(q: string): Promise<CityWithAqi[]> {
    const key = `cities:search:${q.toLowerCase()}`
    const cached = this.cache.get<CityWithAqi[]>(key)
    if (cached) return cached

    const cities = await this.cityRepository.findByName(q)

    const results = await Promise.all(
      cities.map(async (city) => ({
        ...city,
        latestAqi: await this.aqiRepository.findLatestByCity(city.id),
      })),
    )

    this.cache.set(key, results, TTL_15_MIN)
    return results
  }

  async findNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyCityWithAqi[]> {
    const key = `cities:nearby:${lat}:${lng}:${radiusKm}`
    const cached = this.cache.get<NearbyCityWithAqi[]>(key)
    if (cached) return cached

    const cities = await this.cityRepository.findNearby(lat, lng, radiusKm)

    const results = await Promise.all(
      cities.map(async (city) => ({
        ...city,
        latestAqi: await this.aqiRepository.findLatestByCity(city.id),
      })),
    )

    this.cache.set(key, results, TTL_15_MIN)
    return results
  }
}
