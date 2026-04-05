import axios from 'axios'

import type { ICacheService } from '@domain/cache/ICacheService'

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

interface OpenMeteoHourlyAirResponse {
  hourly?: {
    time?: string[]
    european_aqi?: (number | null)[]
  }
}

export class AirQualityForecastService {
  constructor(private readonly cache: ICacheService) {}

  async getForecast(cityId: string, lat: number, lng: number): Promise<AirQualityForecastResult> {
    const key = `air-forecast:${cityId}`
    const cached = this.cache.get<AirQualityForecastResult>(key)
    if (cached) return cached

    const { data } = await axios.get<OpenMeteoHourlyAirResponse>(
      'https://air-quality-api.open-meteo.com/v1/air-quality',
      {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: 'european_aqi',
          forecast_days: 2,
          timezone: 'auto',
        },
        timeout: 12_000,
      },
    )

    const times = data.hourly?.time ?? []
    const aqis = data.hourly?.european_aqi ?? []
    const hours: AirQualityHourPoint[] = times.map((time, i) => ({
      time,
      aqi: typeof aqis[i] === 'number' && Number.isFinite(aqis[i] as number) ? (aqis[i] as number) : null,
    }))

    const result: AirQualityForecastResult = {
      cityId,
      hours,
      source: 'open-meteo',
    }

    this.cache.set(key, result, TTL_1_HOUR)
    return result
  }
}
