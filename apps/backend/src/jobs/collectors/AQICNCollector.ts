import axios from 'axios'

import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { env } from '@infrastructure/config/env'
import { RateLimiter } from '@shared/utils/RateLimiter'
import type { ICollector, NormalizedReading } from './ICollector'

/** AQICN free tier: no explicit rate limit published, but ~1 req/s is safe */
const AQICN_MIN_INTERVAL_MS = 1_100

interface AQICNResponse {
  status: string
  data: {
    aqi: number | string
    iaqi: {
      pm25?: { v: number }
      pm10?: { v: number }
      o3?: { v: number }
      no2?: { v: number }
      co?: { v: number }
      uvi?: { v: number }
    }
  }
}

export class AQICNCollector implements ICollector {
  name = 'AQICNCollector'

  private readonly rateLimiter = new RateLimiter(AQICN_MIN_INTERVAL_MS)

  constructor(private readonly cityRepository: ICityRepository) {}

  async collect(): Promise<NormalizedReading[]> {
    if (!env.AQICN_TOKEN) {
      console.warn('[AQICN] AQICN_TOKEN not set — skipping')
      return []
    }

    const cities = await this.cityRepository.findAll()
    const results: NormalizedReading[] = []

    for (const city of cities) {
      await this.rateLimiter.throttle()
      try {
        const { data } = await axios.get<AQICNResponse>(
          `https://api.waqi.info/feed/geo:${city.lat};${city.lng}/`,
          {
            params: { token: env.AQICN_TOKEN },
            timeout: 8_000,
          },
        )

        if (data.status !== 'ok') continue

        const d = data.data
        const aqiRaw = typeof d.aqi === 'number' ? d.aqi : parseInt(String(d.aqi), 10)

        results.push({
          cityId: city.id,
          city: city.name,
          lat: city.lat,
          lng: city.lng,
          aqi: isNaN(aqiRaw) ? null : aqiRaw,
          pm25: d.iaqi?.pm25?.v ?? null,
          pm10: d.iaqi?.pm10?.v ?? null,
          o3: d.iaqi?.o3?.v ?? null,
          no2: d.iaqi?.no2?.v ?? null,
          co: d.iaqi?.co?.v ?? null,
          uv: d.iaqi?.uvi?.v ?? null,
          timestamp: new Date(),
          source: 'aqicn',
        })
      } catch (err) {
        console.error(`[AQICN] Failed for ${city.name}:`, err instanceof Error ? err.message : err)
      }
    }

    return results
  }
}
