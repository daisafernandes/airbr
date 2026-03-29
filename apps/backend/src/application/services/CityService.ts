import type { AqiReadingData, IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { CityData, ICityRepository, NearbyCity } from '@domain/repositories/ICityRepository'

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
  ) {}

  async listCities(): Promise<CityWithAqi[]> {
    const [cities, readings] = await Promise.all([
      this.cityRepository.findAll(),
      this.aqiRepository.findLatestForAllCities(),
    ])

    const readingsByCity = new Map(readings.map((r) => [r.cityId, r]))

    return cities.map((city) => ({
      ...city,
      latestAqi: readingsByCity.get(city.id) ?? null,
    }))
  }

  async getCityById(id: string): Promise<CityWithAqi | null> {
    const city = await this.cityRepository.findById(id)
    if (!city) return null

    const latestAqi = await this.aqiRepository.findLatestByCity(id)
    return { ...city, latestAqi }
  }

  async searchCities(q: string): Promise<CityWithAqi[]> {
    const cities = await this.cityRepository.findByName(q)

    const results = await Promise.all(
      cities.map(async (city) => ({
        ...city,
        latestAqi: await this.aqiRepository.findLatestByCity(city.id),
      })),
    )

    return results
  }

  async findNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyCityWithAqi[]> {
    const cities = await this.cityRepository.findNearby(lat, lng, radiusKm)

    const results = await Promise.all(
      cities.map(async (city) => ({
        ...city,
        latestAqi: await this.aqiRepository.findLatestByCity(city.id),
      })),
    )

    return results
  }
}
