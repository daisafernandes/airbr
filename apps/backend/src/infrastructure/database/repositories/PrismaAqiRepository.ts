import { prisma } from '../prisma'
import type {
  AqiReadingData,
  AqiUpsertInput,
  HistoryPeriod,
  IAqiRepository,
  RankedCity,
} from '@domain/repositories/IAqiRepository'

const PERIOD_TO_HOURS: Record<HistoryPeriod, number> = {
  '24h': 24,
  '7d': 7 * 24,
  '30d': 30 * 24,
  '1y': 365 * 24,
}

export class PrismaAqiRepository implements IAqiRepository {
  async findLatestByCity(cityId: string): Promise<AqiReadingData | null> {
    return prisma.aqiReading.findFirst({
      where: { cityId },
      orderBy: { timestamp: 'desc' },
    })
  }

  async findLatestForAllCities(): Promise<AqiReadingData[]> {
    // For each city, select the most recent reading using a subquery via groupBy + join
    const cities = await prisma.city.findMany({ select: { id: true } })

    const latest = await Promise.all(
      cities.map((c: { id: string }) =>
        prisma.aqiReading.findFirst({
          where: { cityId: c.id },
          orderBy: { timestamp: 'desc' },
        }),
      ),
    )

    return latest.filter((r): r is AqiReadingData => r !== null)
  }

  async findHistoryByCity(cityId: string, period: HistoryPeriod): Promise<AqiReadingData[]> {
    const hours = PERIOD_TO_HOURS[period]
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return prisma.aqiReading.findMany({
      where: { cityId, timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    })
  }

  async upsert(input: AqiUpsertInput): Promise<AqiReadingData> {
    // AQI readings are time-series — always insert; no true upsert key exists
    return prisma.aqiReading.create({ data: input })
  }

  async getRanking(options?: {
    region?: string
    state?: string
    limit?: number
  }): Promise<{ mostPolluted: RankedCity[]; leastPolluted: RankedCity[] }> {
    const limit = options?.limit ?? 10

    const cityFilter = {
      ...(options?.region ? { region: options.region } : {}),
      ...(options?.state ? { state: options.state } : {}),
    }

    const cities = await prisma.city.findMany({
      where: Object.keys(cityFilter).length ? cityFilter : undefined,
      select: { id: true, name: true, state: true, region: true },
    })

    const latestReadings = await Promise.all(
      cities.map(async (city: { id: string; name: string; state: string; region: string }) => {
        const reading = await prisma.aqiReading.findFirst({
          where: { cityId: city.id },
          orderBy: { timestamp: 'desc' },
          select: { aqi: true },
        })
        return reading ? { cityId: city.id, cityName: city.name, state: city.state, region: city.region, aqi: reading.aqi } : null
      }),
    )

    const ranked = latestReadings
      .filter((r): r is RankedCity => r !== null)
      .sort((a, b) => b.aqi - a.aqi)

    return {
      mostPolluted: ranked.slice(0, limit),
      leastPolluted: ranked.slice(-limit).reverse(),
    }
  }
}
