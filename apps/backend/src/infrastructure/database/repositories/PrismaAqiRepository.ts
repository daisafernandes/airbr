import { prisma } from '../prisma'
import type {
  AqiReadingData,
  AqiUpsertInput,
  HistoryPeriod,
  IAqiRepository,
  OMSComplianceCity,
  RankedCity,
} from '@domain/repositories/IAqiRepository'

const PERIOD_TO_HOURS: Record<HistoryPeriod, number> = {
  '24h': 24,
  '7d': 7 * 24,
  '30d': 30 * 24,
  '1y': 365 * 24,
}

/** Hourly runs insert one row per collector; only Open-Meteo rows have temperature/wind. Merge from the newest Open-Meteo row when the timestamp-latest row is from another source. */
const OPEN_METEO_SUPPLEMENT_MAX_AGE_MS = 48 * 60 * 60 * 1000

function mergeLatestWithOpenMeteoWeather(
  latest: AqiReadingData,
  openMeteo: AqiReadingData | undefined,
): AqiReadingData {
  if (!openMeteo) return latest
  return {
    ...latest,
    temperature: latest.temperature ?? openMeteo.temperature,
    windDirection: latest.windDirection ?? openMeteo.windDirection,
    windSpeed: latest.windSpeed ?? openMeteo.windSpeed,
    uv: latest.uv ?? openMeteo.uv,
  }
}

export class PrismaAqiRepository implements IAqiRepository {
  async findLatestByCity(cityId: string): Promise<AqiReadingData | null> {
    const since = new Date(Date.now() - OPEN_METEO_SUPPLEMENT_MAX_AGE_MS)

    const latest = await prisma.aqiReading.findFirst({
      where: { cityId },
      orderBy: { timestamp: 'desc' },
    })
    if (!latest) return null

    const openMeteo = await prisma.aqiReading.findFirst({
      where: {
        cityId,
        source: 'open-meteo',
        temperature: { not: null },
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'desc' },
    })

    return mergeLatestWithOpenMeteoWeather(latest, openMeteo ?? undefined)
  }

  async findLatestForAllCities(): Promise<AqiReadingData[]> {
    const cities = await prisma.city.findMany({ select: { id: true } })
    const since = new Date(Date.now() - OPEN_METEO_SUPPLEMENT_MAX_AGE_MS)

    const latest = await Promise.all(
      cities.map((c: { id: string }) =>
        prisma.aqiReading.findFirst({
          where: { cityId: c.id },
          orderBy: { timestamp: 'desc' },
        }),
      ),
    )

    const cityIds = cities.map((c: { id: string }) => c.id)
    const openMeteoCandidates = await prisma.aqiReading.findMany({
      where: {
        cityId: { in: cityIds },
        source: 'open-meteo',
        temperature: { not: null },
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'desc' },
    })

    const newestOpenMeteoByCity = new Map<string, AqiReadingData>()
    for (const row of openMeteoCandidates) {
      if (!newestOpenMeteoByCity.has(row.cityId)) {
        newestOpenMeteoByCity.set(row.cityId, row)
      }
    }

    return latest
      .map((r, i): AqiReadingData | null => {
        if (!r) return null
        const om = newestOpenMeteoByCity.get(cities[i].id)
        return mergeLatestWithOpenMeteoWeather(r, om)
      })
      .filter((r): r is AqiReadingData => r !== null)
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

  async getOMSCompliance(): Promise<{ cities: OMSComplianceCity[]; compliantPct: number }> {
    const OMS_PM25_LIMIT = 5

    const cities = await prisma.city.findMany({
      select: { id: true, name: true, state: true, region: true },
    })

    const results = await Promise.all(
      cities.map(async city => {
        const reading = await prisma.aqiReading.findFirst({
          where: { cityId: city.id, pm25: { not: null } },
          orderBy: { timestamp: 'desc' },
          select: { pm25: true },
        })
        return reading?.pm25 != null
          ? {
              cityId: city.id,
              cityName: city.name,
              state: city.state,
              region: city.region,
              pm25: reading.pm25,
              compliant: reading.pm25 <= OMS_PM25_LIMIT,
            }
          : null
      }),
    )

    const withData = results.filter((r): r is OMSComplianceCity => r !== null)
    const compliantCount = withData.filter(r => r.compliant).length
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
