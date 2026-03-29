import axios from 'axios'

import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { RateLimiter } from '@shared/utils/RateLimiter'
import type { ICollector, NormalizedReading } from './ICollector'

/** Open-Meteo: open-source, no key — 300 req/min for free tier. 300ms interval is safe. */
const OPEN_METEO_MIN_INTERVAL_MS = 300

interface OpenMeteoResponse {
  current: {
    european_aqi?: number
    pm10?: number
    pm2_5?: number
    carbon_monoxide?: number
    nitrogen_dioxide?: number
    ozone?: number
    uv_index?: number
  }
}

export class OpenMeteoCollector implements ICollector {
  name = 'OpenMeteoCollector'

  private readonly rateLimiter = new RateLimiter(OPEN_METEO_MIN_INTERVAL_MS)

  constructor(private readonly cityRepository: ICityRepository) {}

  async collect(): Promise<NormalizedReading[]> {
    const cities = await this.cityRepository.findAll()
    const results: NormalizedReading[] = []

    for (const city of cities) {
      await this.rateLimiter.throttle()
      try {
        const { data } = await axios.get<OpenMeteoResponse>(
          'https://air-quality-api.open-meteo.com/v1/air-quality',
          {
            params: {
              latitude: city.lat,
              longitude: city.lng,
              current: [
                'european_aqi',
                'pm10',
                'pm2_5',
                'carbon_monoxide',
                'nitrogen_dioxide',
                'ozone',
                'uv_index',
              ].join(','),
            },
            timeout: 8_000,
          },
        )

        const c = data.current
        if (!c) continue

        results.push({
          cityId: city.id,
          city: city.name,
          lat: city.lat,
          lng: city.lng,
          aqi: c.european_aqi ?? null,
          pm25: c.pm2_5 ?? null,
          pm10: c.pm10 ?? null,
          o3: c.ozone ?? null,
          no2: c.nitrogen_dioxide ?? null,
          co: c.carbon_monoxide ?? null,
          uv: c.uv_index ?? null,
          timestamp: new Date(),
          source: 'open-meteo',
        })
      } catch (err) {
        console.error(
          `[OpenMeteo] Failed for ${city.name}:`,
          err instanceof Error ? err.message : err,
        )
      }
    }

    return results
  }
}
