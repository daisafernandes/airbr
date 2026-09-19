import type { ICacheService } from '@domain/cache/ICacheService'
import type {
  AqiReadingData,
  AqiUpsertInput,
  HistoryPeriod,
  IAqiRepository,
  OMSComplianceCity,
  RankedCity,
} from '@domain/repositories/IAqiRepository'
import type { ICityRepository } from '@domain/repositories/ICityRepository'
import { fetchOpenMeteoCurrent, fetchOpenMeteoHistory } from '@infrastructure/providers/openMeteoClient'
import { RateLimiter } from '@shared/utils/RateLimiter'

const TTL_15_MIN = 60 * 15
const TTL_1_HOUR = 60 * 60
const OMS_PM25_LIMIT = 5
/** Open-Meteo free tier ~300 req/min — match collector spacing. */
const OPEN_METEO_MIN_INTERVAL_MS = 300

const CACHE_ALL = 'live-aqi:all-latest'
const cacheLatestKey = (cityId: string) => `live-aqi:latest:${cityId}`
const cacheHistoryKey = (cityId: string, period: HistoryPeriod) =>
  `live-aqi:history:${cityId}:${period}`

export class LiveAqiRepository implements IAqiRepository {
  private readonly rateLimiter = new RateLimiter(OPEN_METEO_MIN_INTERVAL_MS)
  private allLatestInFlight: Promise<AqiReadingData[]> | null = null

  constructor(
    private readonly cityRepository: ICityRepository,
    private readonly cache: ICacheService,
  ) {}

  async findLatestByCity(cityId: string): Promise<AqiReadingData | null> {
    const cached = this.cache.get<AqiReadingData>(cacheLatestKey(cityId))
    if (cached) return cached

    const allCached = this.cache.get<AqiReadingData[]>(CACHE_ALL)
    if (allCached) {
      const hit = allCached.find((r) => r.cityId === cityId) ?? null
      if (hit) {
        this.cache.set(cacheLatestKey(cityId), hit, TTL_15_MIN)
        return hit
      }
    }

    const city = await this.cityRepository.findById(cityId)
    if (!city) return null

    try {
      await this.rateLimiter.throttle()
      const reading = await fetchOpenMeteoCurrent(city.id, city.lat, city.lng)
      if (!reading) return null
      this.cache.set(cacheLatestKey(cityId), reading, TTL_15_MIN)
      return reading
    } catch (err) {
      console.error(
        `[LiveAqi] Current failed for ${city.name}:`,
        err instanceof Error ? err.message : err,
      )
      return null
    }
  }

  async findLatestForAllCities(): Promise<AqiReadingData[]> {
    return this.loadAllLatest()
  }

  async findLatestForCityIds(cityIds: string[]): Promise<AqiReadingData[]> {
    if (cityIds.length === 0) return []
    const all = await this.loadAllLatest()
    const wanted = new Set(cityIds)
    return all.filter((r) => wanted.has(r.cityId))
  }

  async findHistoryByCity(cityId: string, period: HistoryPeriod): Promise<AqiReadingData[]> {
    const key = cacheHistoryKey(cityId, period)
    const cached = this.cache.get<AqiReadingData[]>(key)
    if (cached) return cached

    const city = await this.cityRepository.findById(cityId)
    if (!city) return []

    try {
      await this.rateLimiter.throttle()
      const readings = await fetchOpenMeteoHistory(city.id, city.lat, city.lng, period)
      const ttl = period === '24h' ? TTL_15_MIN : TTL_1_HOUR
      this.cache.set(key, readings, ttl)
      return readings
    } catch (err) {
      console.error(
        `[LiveAqi] History failed for ${city.name}:`,
        err instanceof Error ? err.message : err,
      )
      return []
    }
  }

  /** Read-only live source — no persistence. */
  async upsert(input: AqiUpsertInput): Promise<AqiReadingData> {
    const timestamp = input.timestamp
    return {
      id: `${input.cityId}:${timestamp.toISOString()}`,
      cityId: input.cityId,
      aqi: input.aqi,
      pm25: input.pm25 ?? null,
      pm10: input.pm10 ?? null,
      o3: input.o3 ?? null,
      no2: input.no2 ?? null,
      co: input.co ?? null,
      uv: input.uv ?? null,
      pollen: input.pollen ?? null,
      windDirection: input.windDirection ?? null,
      windSpeed: input.windSpeed ?? null,
      temperature: input.temperature ?? null,
      humidity: input.humidity ?? null,
      pressure: input.pressure ?? null,
      timestamp,
      source: input.source,
    }
  }

  async getOMSCompliance(): Promise<{ cities: OMSComplianceCity[]; compliantPct: number }> {
    const cities = await this.cityRepository.findAll()
    const byId = new Map(cities.map((c) => [c.id, c]))
    const readings = await this.loadAllLatest()

    const withData: OMSComplianceCity[] = []
    for (const reading of readings) {
      if (reading.pm25 == null) continue
      const city = byId.get(reading.cityId)
      if (!city) continue
      withData.push({
        cityId: city.id,
        cityName: city.name,
        state: city.state,
        region: city.region,
        pm25: reading.pm25,
        compliant: reading.pm25 <= OMS_PM25_LIMIT,
      })
    }

    const compliantCount = withData.filter((r) => r.compliant).length
    const compliantPct =
      withData.length > 0 ? Math.round((compliantCount / withData.length) * 100) : 0

    return {
      cities: withData.sort((a, b) => b.pm25 - a.pm25),
      compliantPct,
    }
  }

  async getRanking(options?: {
    region?: string
    state?: string
    limit?: number
  }): Promise<{ mostPolluted: RankedCity[]; leastPolluted: RankedCity[] }> {
    const limit = options?.limit ?? 10
    const cities = await this.cityRepository.findAll()
    const filtered = cities.filter((c) => {
      if (options?.region && c.region !== options.region) return false
      if (options?.state && c.state !== options.state) return false
      return true
    })
    const allowed = new Set(filtered.map((c) => c.id))
    const byId = new Map(filtered.map((c) => [c.id, c]))

    const readings = (await this.loadAllLatest()).filter((r) => allowed.has(r.cityId))

    const ranked: RankedCity[] = []
    for (const reading of readings) {
      const city = byId.get(reading.cityId)
      if (!city) continue
      ranked.push({
        cityId: city.id,
        cityName: city.name,
        state: city.state,
        region: city.region,
        aqi: reading.aqi,
        pm25: reading.pm25,
      })
    }

    ranked.sort((a, b) => b.aqi - a.aqi)

    return {
      mostPolluted: ranked.slice(0, limit),
      leastPolluted: ranked.slice(-limit).reverse(),
    }
  }

  private async loadAllLatest(): Promise<AqiReadingData[]> {
    const cached = this.cache.get<AqiReadingData[]>(CACHE_ALL)
    if (cached) return cached

    if (this.allLatestInFlight) return this.allLatestInFlight

    this.allLatestInFlight = this.fetchAllLatest()
      .then((readings) => {
        this.cache.set(CACHE_ALL, readings, TTL_15_MIN)
        for (const r of readings) {
          this.cache.set(cacheLatestKey(r.cityId), r, TTL_15_MIN)
        }
        return readings
      })
      .finally(() => {
        this.allLatestInFlight = null
      })

    return this.allLatestInFlight
  }

  private async fetchAllLatest(): Promise<AqiReadingData[]> {
    const cities = await this.cityRepository.findAll()
    const results: AqiReadingData[] = []

    for (const city of cities) {
      const perCity = this.cache.get<AqiReadingData>(cacheLatestKey(city.id))
      if (perCity) {
        results.push(perCity)
        continue
      }

      try {
        await this.rateLimiter.throttle()
        const reading = await fetchOpenMeteoCurrent(city.id, city.lat, city.lng)
        if (reading) results.push(reading)
      } catch (err) {
        console.error(
          `[LiveAqi] Current failed for ${city.name}:`,
          err instanceof Error ? err.message : err,
        )
      }
    }

    return results
  }
}
