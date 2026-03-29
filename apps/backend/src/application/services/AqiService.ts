import type { AqiReadingData, HistoryPeriod, IAqiRepository, RankedCity } from '@domain/repositories/IAqiRepository'

export class AqiService {
  constructor(private readonly aqiRepository: IAqiRepository) {}

  async getHistory(cityId: string, period: HistoryPeriod): Promise<AqiReadingData[]> {
    return this.aqiRepository.findHistoryByCity(cityId, period)
  }

  async getRanking(options?: {
    region?: string
    state?: string
  }): Promise<{ mostPolluted: RankedCity[]; leastPolluted: RankedCity[] }> {
    return this.aqiRepository.getRanking({ ...options, limit: 10 })
  }
}
