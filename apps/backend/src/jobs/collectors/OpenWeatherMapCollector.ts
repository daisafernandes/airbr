import axios, { isAxiosError } from 'axios'

import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { env } from '@infrastructure/config/env'
import { RateLimiter } from '@shared/utils/RateLimiter'

import type { ICollector, NormalizedReading } from './ICollector'

/**
 * OWM free tier: 60 req/min (~1 req/s).
 * With 50 cities per run (every 1h) = 50 req/run — well within limits.
 * 1 200 ms interval ≈ 50 req/min, leaving headroom for retries.
 */
const OWM_MIN_INTERVAL_MS = 1_200

/** Maps OWM 1–5 AQI scale to approximate 0–500 AQI values */
const OWM_AQI_MAP: Record<number, number> = {
  1: 25,
  2: 75,
  3: 125,
  4: 175,
  5: 250,
}

interface OWMResponse {
  list: Array<{
    main: { aqi: number }
    components: {
      co: number
      no: number
      no2: number
      o3: number
      pm2_5: number
      pm10: number
      nh3: number
    }
  }>
}

export class OpenWeatherMapCollector implements ICollector {
  name = 'OpenWeatherMapCollector'

  private readonly rateLimiter = new RateLimiter(OWM_MIN_INTERVAL_MS)

  constructor(private readonly cityRepository: ICityRepository) {}

  async collect(): Promise<NormalizedReading[]> {
    if (!env.OWM_API_KEY) {
      console.warn('[OWM] OWM_API_KEY not set — skipping')
      return []
    }

    const cities = await this.cityRepository.findAll()
    const results: NormalizedReading[] = []

    for (const city of cities) {
      await this.rateLimiter.throttle()
      try {
        const { data } = await axios.get<OWMResponse>(
          'http://api.openweathermap.org/data/2.5/air_pollution',
          {
            params: { lat: city.lat, lon: city.lng, appid: env.OWM_API_KEY },
            timeout: 8_000,
          },
        )

        const item = data.list?.[0]
        if (!item) continue

        results.push({
          cityId: city.id,
          city: city.name,
          lat: city.lat,
          lng: city.lng,
          aqi: OWM_AQI_MAP[item.main.aqi] ?? item.main.aqi * 50,
          pm25: item.components.pm2_5 ?? null,
          pm10: item.components.pm10 ?? null,
          o3: item.components.o3 ?? null,
          no2: item.components.no2 ?? null,
          co: item.components.co ?? null,
          timestamp: new Date(),
          source: 'openweathermap',
        })
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          const body = err.response.data
          console.error(
            `[OWM] Failed for ${city.name}:`,
            err.response.status,
            typeof body === 'object' && body !== null ? JSON.stringify(body) : body ?? err.message,
          )
        } else {
          console.error(`[OWM] Failed for ${city.name}:`, err instanceof Error ? err.message : err)
        }
      }
    }

    return results
  }
}
