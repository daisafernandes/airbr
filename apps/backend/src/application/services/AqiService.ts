import type { ICacheService } from '@domain/cache/ICacheService'
import type { AqiReadingData, HistoryPeriod, IAqiRepository, RankedCity } from '@domain/repositories/IAqiRepository'

const TTL_15_MIN = 60 * 15
const TTL_1_HOUR = 60 * 60

export class AqiService {
  constructor(
    private readonly aqiRepository: IAqiRepository,
    private readonly cache: ICacheService,
  ) {}

  async getHistory(cityId: string, period: HistoryPeriod): Promise<AqiReadingData[]> {
    const key = `city:${cityId}:history:${period}`
    const cached = this.cache.get<AqiReadingData[]>(key)
    if (cached) return cached

    const result = await this.aqiRepository.findHistoryByCity(cityId, period)
    const ttl = period === '24h' ? TTL_15_MIN : TTL_1_HOUR
    this.cache.set(key, result, ttl)
    return result
  }

  async getRanking(options?: {
    region?: string
    state?: string
  }): Promise<{ mostPolluted: RankedCity[]; leastPolluted: RankedCity[] }> {
    const key = `ranking:${options?.region ?? 'all'}:${options?.state ?? 'all'}`
    const cached = this.cache.get<{ mostPolluted: RankedCity[]; leastPolluted: RankedCity[] }>(key)
    if (cached) return cached

    const result = await this.aqiRepository.getRanking({ ...options, limit: 10 })
    this.cache.set(key, result, TTL_15_MIN)
    return result
  }
}
