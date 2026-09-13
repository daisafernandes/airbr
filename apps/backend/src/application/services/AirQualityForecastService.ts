import type { ICacheService } from '@domain/cache/ICacheService'
import { fetchOpenMeteoForecast } from '@infrastructure/providers/openMeteoClient'

const TTL_1_HOUR = 60 * 60

export interface AirQualityHourPoint {
  time: string
  aqi: number | null
}

export interface AirQualityForecastResult {
  cityId: string
  hours: AirQualityHourPoint[]
  source: 'open-meteo'
}

export class AirQualityForecastService {
  constructor(private readonly cache: ICacheService) {}

  async getForecast(cityId: string, lat: number, lng: number): Promise<AirQualityForecastResult> {
    const key = `air-forecast:${cityId}`
    const cached = this.cache.get<AirQualityForecastResult>(key)
    if (cached) return cached

    const hours = await fetchOpenMeteoForecast(lat, lng, 2)

    const result: AirQualityForecastResult = {
      cityId,
      hours,
      source: 'open-meteo',
    }

    this.cache.set(key, result, TTL_1_HOUR)
    return result
  }
}
